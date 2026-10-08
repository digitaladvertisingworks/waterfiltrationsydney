"""Run Composio Platform API calls for the Google Ads account (customer 5765384103).

    python ads/composio_run.py accounts
    python ads/composio_run.py connect        (prints a Google sign-in link for this project)
    python ads/composio_run.py exec TOOL_SLUG path/to/arguments.json

The key is read from ads/.env (COMPOSIO_API_KEY=...) and is never printed.
`exec` uses the single ACTIVE googleads connected account. Put "validate_only": true
in the arguments file to dry-run a mutate call.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = 'https://backend.composio.dev/api/v3'


def load_key():
    for line in open(os.path.join(HERE, '.env'), encoding='utf-8-sig'):
        m = re.match(r'\s*COMPOSIO_API_KEY\s*=\s*(\S+)', line)
        if m:
            return m.group(1).strip('"\'')
    sys.exit('COMPOSIO_API_KEY not found in ads/.env')


def call(method, path, body=None):
    req = urllib.request.Request(
        BASE + path, method=method, headers={'x-api-key': load_key(), 'content-type': 'application/json'},
        data=json.dumps(body).encode() if body is not None else None)
    try:
        return json.load(urllib.request.urlopen(req, timeout=60))
    except urllib.error.HTTPError as e:
        sys.exit(f'HTTP {e.code}: {e.read().decode()[:600]}')


def googleads_account():
    items = call('GET', '/connected_accounts?toolkit_slugs=googleads&statuses=ACTIVE').get('items', [])
    if len(items) != 1:
        sys.exit(f'expected 1 active googleads account, found {len(items)}')
    return items[0]


CUSTOMER = '5765384103'


def run(acct, slug, args):
    out = call('POST', f'/tools/execute/{slug}', {'connected_account_id': acct['id'], 'user_id': acct.get('user_id'),
                                                  'arguments': dict(customer_id=CUSTOMER, **args), 'version': 'latest'})
    if not out.get('successful'):
        sys.exit(f'{slug} failed: {json.dumps(out)[:1500]}')
    return out.get('data') or {}


def push_additions(live):
    """Create the ad groups, keywords and RSAs in wfs-additions.csv. Existing ad groups are skipped."""
    import csv
    acct = googleads_account()
    rows = list(csv.DictReader(open(os.path.join(HERE, 'wfs-additions.csv'), encoding='utf-8-sig')))
    camps = {r['campaign']['name']: r['campaign']['resourceName'] for r in run(acct, 'GOOGLEADS_SEARCH_STREAM_GAQL', {
        'query': "SELECT campaign.name FROM campaign WHERE campaign.name LIKE 'WFS |%' AND campaign.status != 'REMOVED'"})
        .get('results', [])}
    have = {(r['campaign']['name'], r['adGroup']['name']): r['adGroup']['resourceName'] for r in run(
        acct, 'GOOGLEADS_SEARCH_STREAM_GAQL', {
            'query': "SELECT campaign.name, ad_group.name FROM ad_group WHERE campaign.name LIKE 'WFS |%' "
                     "AND ad_group.status != 'REMOVED'"}).get('results', [])}
    with_ads = {r['adGroup']['resourceName'] for r in run(acct, 'GOOGLEADS_SEARCH_STREAM_GAQL', {
        'query': "SELECT ad_group.id FROM ad_group_ad WHERE campaign.name LIKE 'WFS |%' "
                 "AND ad_group_ad.status != 'REMOVED'"}).get('results', [])}
    groups = {}
    for r in rows:
        if r['Ad Group'] and not r['Keyword'] and not r['Ad type']:
            groups[(r['Campaign'], r['Ad Group'])] = {'kws': [], 'ads': []}
    for r in rows:
        g = groups.get((r['Campaign'], r['Ad Group']))
        if g is None:
            continue
        if r['Keyword']:
            g['kws'].append(r['Keyword'])
        elif r['Ad type']:
            heads = [{'text': r[f'Headline {i}']} for i in range(1, 16) if r[f'Headline {i}']]
            if r['Headline 1 position'] == '1':
                heads[0]['pinned_field'] = 'HEADLINE_1'
            g['ads'].append({'final_urls': [r['Final URL']], 'responsive_search_ad': {
                'headlines': heads, 'descriptions': [{'text': r[f'Description {i}']} for i in range(1, 5)
                                                     if r[f'Description {i}']],
                'path1': r['Path 1'], 'path2': r['Path 2']}})
    totals = {'ad groups': 0, 'keywords': 0, 'ads': 0, 'skipped': 0}
    for (camp, name), g in groups.items():
        if camp not in camps:
            sys.exit(f'campaign not found: {camp}')
        if (camp, name) in have:
            ag = have[(camp, name)]
            if ag in with_ads or not live:
                totals['skipped'] += 1
                print('skip (exists):', camp, '/', name)
                continue
            run(acct, 'GOOGLEADS_MUTATE_AD_GROUP_ADS', {'operations': [{'create': {
                'ad_group': ag, 'status': 'ENABLED', 'ad': ad}} for ad in g['ads']]})
            totals['ads'] += len(g['ads'])
            print('ads added to existing:', camp, '/', name, ag)
            continue
        res = run(acct, 'GOOGLEADS_MUTATE_AD_GROUPS', {'validate_only': not live, 'operations': [{'create': {
            'campaign': camps[camp], 'name': name, 'status': 'ENABLED', 'type': 'SEARCH_STANDARD'}}]})
        totals['ad groups'] += 1
        if not live:
            print('ok (validated):', camp, '/', name, f"- {len(g['kws'])} keywords, {len(g['ads'])} ads")
            continue
        ag = res['results'][0]['resource_name']
        run(acct, 'GOOGLEADS_MUTATE_AD_GROUP_CRITERIA', {'operations': [{'create': {
            'ad_group': ag, 'status': 'ENABLED', 'keyword': {'text': k, 'match_type': 'EXACT'}}} for k in g['kws']]})
        run(acct, 'GOOGLEADS_MUTATE_AD_GROUP_ADS', {'operations': [{'create': {
            'ad_group': ag, 'status': 'ENABLED', 'ad': ad}} for ad in g['ads']]})
        totals['keywords'] += len(g['kws'])
        totals['ads'] += len(g['ads'])
        print('created:', camp, '/', name, ag)
    print(('LIVE ' if live else 'DRY RUN ') + str(totals))


def main(argv):
    if len(argv) >= 2 and argv[1] == 'accounts':
        for a in call('GET', '/connected_accounts?toolkit_slugs=googleads').get('items', []):
            print(a.get('id'), a.get('status'), a.get('user_id'))
    elif len(argv) >= 2 and argv[1] == 'tools':
        q = '&search=' + argv[2] if len(argv) > 2 else ''
        for t in call('GET', f'/tools?toolkit_slug=googleads&toolkit_versions=latest&limit=300{q}').get('items', []):
            print(t.get('slug'), '|', t.get('version'))
    elif len(argv) >= 2 and argv[1] == 'push-additions':
        push_additions(live='--live' in argv)
    elif len(argv) == 2 and argv[1] == 'connect':
        cfgs = call('GET', '/auth_configs?toolkit_slug=googleads').get('items', [])
        cfg = cfgs[0] if cfgs else call('POST', '/auth_configs', {
            'toolkit': {'slug': 'googleads'}, 'auth_config': {'type': 'use_composio_managed_auth'}}).get('auth_config')
        cid = cfg.get('id')
        link = call('POST', '/connected_accounts/link', {'auth_config_id': cid, 'user_id': 'waterfiltration'})
        print('auth config:', cid)
        print('open this link and sign in as quote@waterfiltration.sydney:')
        print(link.get('redirect_url'))
    elif len(argv) in (4, 5) and argv[1] == 'exec':
        acct = googleads_account()
        args = json.load(open(argv[3], encoding='utf-8'))
        out = call('POST', f'/tools/execute/{argv[2]}',
                   {'connected_account_id': acct['id'], 'user_id': acct.get('user_id'), 'arguments': args,
                    'version': 'latest'})
        text = json.dumps(out, indent=1)
        print(text if '--full' in argv else text[:6000])
    else:
        sys.exit(__doc__)


if __name__ == '__main__':
    main(sys.argv)
