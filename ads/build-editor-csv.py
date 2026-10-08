"""Google Ads Editor import for the exact-match installation campaigns.

    python ads/build-editor-csv.py   ->  ads/wfs-exact-campaigns.csv

Import in Google Ads Editor: Account > Import > From file, review, then Post.
Everything is created PAUSED at campaign level, so nothing spends until a
campaign is enabled.

Copy rules (from the Sep 2026 competitor audit):
  - only claims the install lander already makes; nothing that needs sign-off
  - no finance, no competitor names, no health claims, no phone numbers
    in ad text (Google policy: use a call asset instead)
  - "NSW licence" lines never run in the Canberra (ACT) campaign
  - "$0 callout" and the $5,500 bundle price run in Sydney only, until
    confirmed for the regions
Headline 1 of every ad is keyword insertion, pinned to position 1. Its
default text (what shows when the keyword is too long) is what the 30-char
limit is checked against.
"""
import csv
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'wfs-exact-campaigns.csv')
LANDER = 'https://install.waterfiltration.sydney'

SYDNEY_GEOS = ('9071696,9071706,9071710,9071711,9071713,9071714,9071715,9071716,9071717,9071718,9071719,9071720,'
               '9071721,9071722,9071723,9071724,9071725,9071726,9071727,9071728,9071731,9071732,9071742,9071745,'
               '9071746,9071749,9071755,9071756,9071757,9071758,9071764,9071782,9071783,9071784,9071785,9071786,'
               '9071787,9071788,9071789,9071790,9071791,9071792,9071793,9071795,9071796,9071800,9071801,9071803,'
               '9071804,9071805,9071806,9071807,9071808,9071809,9071810,9071812,9071813,9071814,9071816,9071817,'
               '9071819,9071820,9071821,9071822,9071824,9071827,9071828,9071829,9071830,9071831,9071833,9071834,'
               '9071836,9071837,9071839,9071846,9071852,9071855,9071856,9071857,9071858,9071859,9071860,9071861,'
               '9071862,9071863,9071866,9071867,9071868,9071869,9071871,9071872,9071873,9071874,9071875,9071876,'
               '9071877,9071878,9071879,9071881,9071882,9071883,9071885,9071886,9071887,9071895,9071896,9071897,'
               '9071898,9071899,9071900,9071903,9071904,9071905,9112533,9112584,9112595,9112606,9112615,9112632,'
               '9112638,9112649,9112658,9112662,9112711,9112715,9112751,9112783,9112831,9199005,9214986,'
               # added 29 Sep 2026: Sydney council gaps + Blue Mountains, Hawkesbury, Wollondilly postcodes
               '9112610,9112723,9112637,9112607,9112779,9112616,9112578,9112819,9112572,9112707,9112600,'
               '9112628,9112656,9112699,9071908,9071934,9071909,9071910,9071734,9071663,9071661,9071662,'
               '9071664,9071708,9071709,9071638,9071704,9071707,9071698,9071705,9071700,9071697,9071699,'
               '9071702,9071701,9071703').split(',')

SCHEDULE = ';'.join(f'({d}[08:00-20:00])' for d in
                    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])

# area -> (campaign suffix, geo ids, lander path, daily budget AUD, is ACT)
AREAS = {
    'Sydney': (SYDNEY_GEOS, '/', 50, False),
    # Newcastle city + 30 postcodes (2280-2308 Newcastle/Lake Macquarie, 2320-2324 Maitland/Raymond Terrace), 29 Sep 2026
    'Newcastle': (['1000255'] + '9072202,9072203,9072214,9072204,9072213,9072220,9072211,9072209,9072215,9072216,9072201,9072218,9072194,9072196,9072193,9072197,9072200,9072198,9072195,9072219,9072223,9072199,9072217,9072221,9072222,9072225,9072229,9072224,9072210,9072233'.split(','), '/newcastle', 10, False),
    # Wollongong city + postcodes 2500-2534 (Helensburgh to Gerringong) + 11 suburbs, 29 Sep 2026
    'Wollongong': (['1000314'] + '9071919,9071914,9071916,9071911,9071894,9071892,9071921,9071922,9071923,9071920,9071915,9071917,9071918,9071927,9071913,9071924,9071912,9071926,9071928,9193786,9193023,9192992,9191385,9190489,9191758,9221553,9192988,1000225,9193186,9210140'.split(','), '/wollongong', 10, False),
    # Central Coast + postcodes 2250-2265 + 18 suburbs, 29 Sep 2026
    'Central Coast': (['1000594'] + '9071637,9072184,9071639,9072185,9072187,9072189,9072186,9072188,9072191,9072192,9072190,9072206,9189211,9060866,9194729,9194090,9194933,9189180,9189828,9195123,9189601,9194030,9190149,9190035,9194799,9216560,9191105,9194974,9191565,9215341'.split(','), '/central-coast', 10, False),
    'Canberra': (['20034'], '/canberra', 10, True),
}

# ---------------------------------------------------------------- keywords
SYDNEY_GROUPS = {
    'Installation': ('Water Filter Installation', [
        'water filter installation', 'water filtration installation', 'water filter installation sydney',
        'sydney water filter installation', 'water filter install sydney', 'install water filter',
        'water filter installation service', 'water filter installers', 'water filtration installers near me',
        'water filter plumber', 'water filter plumber sydney', 'water filter sydney', 'water filters sydney',
        'water filtration sydney']),
    'Whole House': ('Whole House Water Filters', [
        'whole house water filter installation', 'whole house water filtration installation',
        'whole house water filter sydney', 'whole house water filters sydney',
        'whole house water filtration system sydney', 'whole home water filter installation',
        'whole house filter installation', 'whole house water filtration sydney']),
    'Under-Sink & Filter Taps': ('Under Sink Water Filters', [
        'under sink water filter installation', 'under sink water filter sydney', 'water filter tap installation',
        'filtered water tap installation', 'drinking water filter installation',
        'under sink water filter system sydney']),
    'Reverse Osmosis': ('Reverse Osmosis Systems', [
        'reverse osmosis installation', 'reverse osmosis sydney', 'reverse osmosis water filter sydney',
        'reverse osmosis installation sydney', 'ro water filter installation', 'reverse osmosis filter sydney']),
    'Service & Replacement': ('Water Filter Servicing', [
        # 'water filter replacement' paused 8 Oct 2026: brought in cartridge shoppers, 0 conversions
        'water filter service', 'water filter services', 'water filter servicing',
        # replacement keywords removed 8 Oct 2026 ('replacement' is now a campaign negative)
        ]),
}


def regional_groups(area):
    r = area.lower()
    return {
        'Installation': (f'Water Filters {area}', [
            f'water filter installation {r}', f'water filter installer {r}', f'water filter {r}',
            f'water filters {r}', f'water filtration {r}', f'water filter plumber {r}',
            'water filter installation', 'water filtration installation', 'install water filter',
            'water filter installers', 'water filter plumber']),
        'Systems & Service': (f'Filtration {area}', [
            f'whole house water filter {r}', f'whole house water filtration {r}', f'under sink water filter {r}',
            f'reverse osmosis {r}', f'water filter service {r}',
            'whole house water filter installation', 'under sink water filter installation',
            'reverse osmosis installation']),
    }


# ---------------------------------------------------------------- ad copy
GROUP_LINES = {
    'Installation': ['Water Filters Installed', 'Filters Fitted by a Plumber'],
    'Whole House': ['Filtered Water at Every Tap', 'Whole-House Filters Installed'],
    'Under-Sink & Filter Taps': ['Under-Sink Filters Installed', 'Filter Taps Fitted Neatly'],
    'Reverse Osmosis': ['Reverse Osmosis Installed', 'RO Sized to Your Pressure'],
    'Service & Replacement': ['Cartridges Replaced & Serviced', 'We Service Other Brands Too'],
    'Cost & Quote': ['Fixed Installed Price Quoted', 'Know the Cost Before You Book'],
    'Brand Installs': ['Licensed Install, Any Brand', 'Fitted by a Licensed Plumber'],
    'Brand': ['Safe Water Filtration', 'Licensed Water Filter Plumbers'],
    'Systems & Service': ['Whole-House, Under-Sink & RO', 'Cartridges Replaced & Serviced'],
}


def angle_headlines(angle, area, act):
    lic = [] if act else ['NSW Licence No. 358626C']
    local = [f'Licensed Plumbers {area}'[:30]] if len(f'Licensed Plumbers {area}') <= 30 else [f'{area} Filter Installs']
    if angle == 'A':  # installed and answered for
        return ['Licensed Plumber Installs It', 'We Install. We Answer For It', 'Lifetime Labour Warranty',
                'Leak-Tested Before We Leave', 'Isolation Valves Both Sides', 'Installed Neat, Left Clean',
                'Not a Kit. A Licensed Install', 'WaterMark Certified Parts', 'Pressure-Tested Joints',
                'Book a Licensed Installer', 'Servicing Clearance Built In', 'Commissioned in One Visit'] + lic + local
    if angle == 'B':  # costs and measurements upfront
        return ['Cartridge Costs Upfront', 'Know the Running Cost First', 'No Surprise at First Service',
                'Fixed Installed Price', 'Pressure Checked, Then Sized', 'Flow Checked Before We Leave',
                'Sized to Your Home\'s Flow', 'We Say What It Won\'t Fix', 'Quote Lists Every Cartridge',
                'Every Cartridge Priced', 'Change Intervals Explained', 'We Measure, Then Specify'] + local
    return ['Your Fixed Price Upfront', 'No Pressure, No Obligation', 'Nothing Booked Till You Agree',
            'One Price, One Plumber', 'Compare Us Properly', 'Sometimes Under-Sink Is Enough',
            'Honest Advice, Fixed Price', 'Get a Free Quote', 'Talk to the Plumber Direct',
            'Plumber-Led Quote, Not a Pitch', 'Fixed Price, Cartridges Listed', 'Honest Advice on Your Water'] + local


def sydney_extras(angle):
    return {'A': ['$0 Callout Across Sydney'], 'B': ['Whole Home + RO $5,500 Fitted'],
            'C': ['Free Water Assessment']}[angle]


def descriptions(angle, area, act, dki_default):
    lic = 'a licensed plumber' if act else 'a NSW licensed plumber'
    d = {
        'A': [f'{{KeyWord:{dki_default}}} by {lic}. Valves fitted, joints tested.',
              'Lifetime warranty on our installation labour. If our workmanship fails, we come back.',
              'Housings mounted where the sumps can actually be dropped at change time. Area left clean.',
              'Installed, pressure-tested and commissioned in one visit. Flow checked before we leave.'],
        'B': ['Your quote shows the fixed installed price and what each replacement cartridge costs.',
              'We check incoming pressure and peak demand before we specify any whole-house system.',
              f'{{KeyWord:{dki_default}}}: fixed price, every cartridge listed.',
              'We tell you what a system is designed to reduce and what it is not, before you spend.'],
        'C': ['No obligation, no pressure. Nothing is booked until you have the price.',
              'Fixed installed price with the running costs shown, so you can compare us fairly.',
              'Mainly want better drinking water? Under-sink may be all you need, and we will say so.',
              f'{{KeyWord:{dki_default}}} quote from a licensed plumber. Fixed price, no obligation.'],
    }[angle]
    return d


def visible_len(text):
    """Length Google checks for keyword insertion: the default text."""
    return len(re.sub(r'\{KeyWord:([^}]*)\}', r'\1', text, flags=re.I))


NO_DKI = {'Brand Installs'}


def build_ad(group, dki_default, angle, area, act):
    pool = [f'{{KeyWord:{dki_default}}}'] + GROUP_LINES[group]
    if area == 'Sydney':
        pool += sydney_extras(angle)
    pool += angle_headlines(angle, area, act)
    seen, heads = set(), []
    for h in pool:
        if h.lower() not in seen:
            seen.add(h.lower())
            heads.append(h)
    heads = heads[:15]
    assert len(heads) == 15, (area, group, angle, len(heads))
    for h in heads:
        assert visible_len(h) <= 30, (area, group, h, visible_len(h))
        if act:
            assert 'NSW' not in h, h
        if area != 'Sydney':
            assert '$' not in h, h
    descs = descriptions(angle, area, act, dki_default)
    if group in NO_DKI:
        heads = [re.sub(r'\{KeyWord:([^}]*)\}', r'\1', h, flags=re.I) for h in heads]
        descs = [re.sub(r'\{KeyWord:([^}]*)\}', r'\1', d, flags=re.I) for d in descs]
    for d in descs:
        assert visible_len(d) <= 90, (d, visible_len(d))
    return heads, descs


# ---------------------------------------------------------------- CSV
COLS = (['Campaign', 'Campaign Type', 'Networks', 'Budget', 'Budget type', 'Bid Strategy Type',
         'Maximum CPC bid limit', 'Campaign Status', 'Languages', 'Ad Schedule', 'Location ID',
         'Ad Group', 'Ad Group Status', 'Keyword', 'Criterion Type', 'Status', 'Ad type']
        + [f'Headline {i}' for i in range(1, 16)] + ['Headline 1 position']
        + [f'Description {i}' for i in range(1, 5)] + ['Path 1', 'Path 2', 'Final URL'])

rows, stats = [], {'campaigns': 0, 'ad groups': 0, 'keywords': 0, 'ads': 0}


def row(**kw):
    r = {c: '' for c in COLS}
    for k, v in kw.items():
        r[k.replace('_', ' ')] = v
    rows.append(r)


for area, (geos, path, budget, act) in AREAS.items():
    camp = f'WFS | Search | {area} | Exact'
    stats['campaigns'] += 1
    row(Campaign=camp, **{'Campaign Type': 'Search', 'Networks': 'Google search', 'Budget': f'{budget:.2f}',
                          'Budget type': 'Daily', 'Bid Strategy Type': 'Maximize clicks',
                          'Maximum CPC bid limit': '13.00', 'Campaign Status': 'Paused', 'Languages': 'en',
                          'Ad Schedule': SCHEDULE})
    for g in geos:
        row(Campaign=camp, **{'Location ID': g})
    groups = SYDNEY_GROUPS if area == 'Sydney' else regional_groups(area)
    path2 = area.replace(' ', '-')[:15]
    for group, (dki_default, kws) in groups.items():
        stats['ad groups'] += 1
        row(Campaign=camp, **{'Ad Group': group, 'Ad Group Status': 'Enabled'})
        assert len(set(kws)) == len(kws), (area, group)
        for k in kws:
            stats['keywords'] += 1
            row(Campaign=camp, **{'Ad Group': group, 'Keyword': k, 'Criterion Type': 'Exact', 'Status': 'Enabled'})
        for angle in 'ABC':
            heads, descs = build_ad(group, dki_default, angle, area, act)
            stats['ads'] += 1
            ad = {'Ad Group': group, 'Ad type': 'Responsive search ad', 'Status': 'Enabled',
                  'Headline 1 position': '1', 'Path 1': 'Installation', 'Path 2': path2,
                  'Final URL': LANDER + path}
            ad.update({f'Headline {i}': h for i, h in enumerate(heads, 1)})
            ad.update({f'Description {i}': d for i, d in enumerate(descs, 1)})
            row(Campaign=camp, **ad)


# ---------------------------------------------------------------- additions (live campaigns, 8 Oct 2026)
# Intent-gap groups from the keyword-intent review: cost/quote searches, brand-name installs and
# brand defence. Imported on top of the live campaigns, so only ad groups/keywords/ads are written.
ADD_OUT = os.path.join(HERE, 'wfs-additions.csv')
main_rows = rows
rows = []
ADDITIONS = {
    'Sydney': {
        'Cost & Quote': ('Water Filter Installation Cost', [
            'water filter installation cost sydney', 'water filter installation quote',
            'whole house water filter installation cost', 'under sink water filter installation cost',
            'plumber to install water filter']),
        'Brand Installs': ('Water Filter Installation', [
            'puretec installation sydney', 'zip hydrotap installation', 'billi tap installation']),
        'Brand': ('Safe Water Filtration', [
            'safe water filtration', 'safe water filtration sydney', 'safe water filtration reviews',
            'water filtration sydney reviews', 'waterfiltration.sydney']),
    },
}
for area in AREAS:
    if area != 'Sydney':
        r = area.lower()
        ADDITIONS[area] = {
            'Cost & Quote': ('Water Filter Installation Cost', [f'water filter installation cost {r}',
                                                          f'water filter installation quote {r}']),
            'Brand': ('Safe Water Filtration', ['safe water filtration', f'safe water filtration {r}',
                                                'safe water filtration reviews']),
        }
add_stats = {'ad groups': 0, 'keywords': 0, 'ads': 0}
for area, groups in ADDITIONS.items():
    _, path, _, act = AREAS[area][0], AREAS[area][1], AREAS[area][2], AREAS[area][3]
    camp = f'WFS | Search | {area} | Exact'
    path2 = area.replace(' ', '-')[:15]
    for group, (dki_default, kws) in groups.items():
        add_stats['ad groups'] += 1
        row(Campaign=camp, **{'Ad Group': group, 'Ad Group Status': 'Enabled'})
        for k in kws:
            add_stats['keywords'] += 1
            row(Campaign=camp, **{'Ad Group': group, 'Keyword': k, 'Criterion Type': 'Exact', 'Status': 'Enabled'})
        for angle in 'ABC':
            heads, descs = build_ad(group, dki_default, angle, area, act)
            add_stats['ads'] += 1
            ad = {'Ad Group': group, 'Ad type': 'Responsive search ad', 'Status': 'Enabled',
                  'Headline 1 position': '' if group in NO_DKI else '1', 'Path 1': 'Installation', 'Path 2': path2,
                  'Final URL': LANDER + path}
            ad.update({f'Headline {i}': h for i, h in enumerate(heads, 1)})
            ad.update({f'Description {i}': d for i, d in enumerate(descs, 1)})
            row(Campaign=camp, **ad)
with open(ADD_OUT, 'w', newline='', encoding='utf-8-sig') as fh:
    w = csv.DictWriter(fh, fieldnames=COLS)
    w.writeheader()
    w.writerows(rows)
print(ADD_OUT, add_stats)
rows = main_rows

with open(OUT, 'w', newline='', encoding='utf-8-sig') as fh:
    w = csv.DictWriter(fh, fieldnames=COLS)
    w.writeheader()
    w.writerows(rows)
print(OUT)
print(stats)
