"""Campaign negative keyword list for the WFS exact-match installation campaigns.

    python ads/negatives.py          -> checks the list, writes ads/negatives.csv

The campaigns sell licensed INSTALLATION and SERVICING across Greater Sydney,
Newcastle, Wollongong, the Central Coast and the ACT. Negatives cut searches
that can't become an install job: jobs, DIY, retail/product shopping, other
kinds of filters, unrelated plumbing, places we don't serve, and brand-only
searches for competitors and product makers.

Safety rules, enforced below (the script fails if one breaks):
  1. No negative may block any positive keyword in wfs-exact-campaigns.csv.
  2. No negative may block a PROTECTED search: work the business wants
     (commercial installs, emergency installs, servicing other people's
     systems, and the brands the lander says we install: Puretec, Zip, Billi,
     Aqua Cooler, Blue Mountain Co, Waterworks, and Shield from the HPF-3 bundle).
  3. Service-area place names never appear as negatives.
Match types: PHRASE for distinctive words, EXACT for brand names made of
ordinary words (so "pure water systems" can't block "pure water system installed").
"""
import csv
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
P, E = 'PHRASE', 'EXACT'

NEGATIVES = {
    'Jobs & training': (P, [
        'job', 'jobs', 'career', 'careers', 'vacancy', 'vacancies', 'hiring', 'employment', 'salary', 'wage',
        'apprentice', 'apprenticeship', 'traineeship', 'course', 'courses', 'certificate iii', 'tafe',
        'training', 'resume', 'seek', 'indeed', 'recruitment', 'volunteer', 'internship', 'work experience']),
    'DIY & how-to': (P, [
        'diy', 'how to', 'how do i', 'how do you', 'do it yourself', 'yourself', 'tutorial', 'instructions',
        'manual', 'diagram', 'schematic', 'step by step', 'guide pdf', 'pdf', 'youtube', 'video', 'videos',
        'install kit', 'installation kit', 'fittings kit', 'self install', 'self installation']),
    'Research & info (not buying)': (P, [
        'wikipedia', 'wiki', 'reddit', 'forum', 'whirlpool forum', 'quora', 'definition', 'meaning',
        'what is a', 'what is an', 'what does', 'history of', 'invented', 'essay', 'assignment', 'science project',
        'experiment', 'worksheet', 'diagram of', 'ppt', 'powerpoint', 'statistics', 'market size',
        'industry report', 'research paper', 'journal', 'thesis']),
    'Buying products, not installs': (P, [
        'buy', 'buy online', 'online shop', 'shop online', 'for sale', 'on sale', 'sale', 'cheap', 'cheapest',
        'discount', 'coupon', 'promo code', 'voucher', 'afterpay', 'zip pay', 'clearance', 'wholesale',
        'bulk buy', 'free shipping', 'shipping', 'delivery australia', 'dispatch', 'in stock', 'catalogue',
        'second hand', 'secondhand', 'used', 'refurbished', 'gumtree', 'marketplace', 'facebook marketplace',
        'ebay', 'amazon', 'aliexpress', 'temu', 'catch', 'kogan', 'mydeal', 'trade me', 'bunnings', 'kmart',
        'big w', 'target', 'aldi', 'costco', 'ikea', 'woolworths', 'coles', 'officeworks', 'harvey norman',
        'jb hi fi', 'jb hifi', 'the good guys', 'appliances online', 'myer', 'david jones', 'mitre 10',
        'masters', 'reece', 'tradelink', 'plumbing plus', 'plumbers choice', 'samios', 'bathroom warehouse']),
    'Rental & hire': (P, ['lease', 'leasing', 'subscription']),
    'Jugs, bottles & portable': (P, [
        'jug', 'jugs', 'pitcher', 'pitchers', 'bottle', 'bottles', 'water bottle', 'drink bottle', 'straw',
        'lifestraw', 'portable', 'travel', 'camping', 'camp', 'hiking', 'backpacking', 'survival', 'emergency kit',
        'bushwalking', 'caravan', 'caravans', 'rv', 'motorhome', 'boat', 'marine', '4wd', 'off grid shower',
        'cooler hire', 'benchtop', 'countertop',
        'gravity filter', 'gravity water filter', 'faucet mount', 'tap mount', 'tap attachment']),
    'Fridge & appliance filters': (P, [
        'fridge', 'fridges', 'refrigerator', 'refrigerators', 'freezer', 'lg', 'samsung',
        'fisher and paykel', 'fisher & paykel', 'westinghouse', 'electrolux', 'haier', 'hisense', 'bosch',
        'whirlpool', 'mitsubishi', 'panasonic', 'smeg', 'miele', 'kelvinator', 'ge filter', 'breville', 'delonghi', 'nespresso', 'kettle', 'dishwasher', 'washing machine', 'dryer', 'humidifier']),
    'Other kinds of filter': (P, [
        'pool', 'pools', 'pool filter', 'spa', 'hot tub', 'jacuzzi', 'pond', 'aquarium', 'fish tank', 'fish',
        'turtle', 'koi', 'air filter', 'air filters', 'air purifier', 'air purifiers', 'aircon', 'air con',
        'air conditioner', 'air conditioning', 'hvac', 'furnace', 'vacuum', 'range hood', 'rangehood',
        'car', 'cars', 'oil filter', 'fuel filter', 'diesel', 'engine', 'cabin filter', 'motorcycle',
        'coffee filter', 'coffee filters', 'beer', 'brewing', 'homebrew', 'wine', 'kombucha',
        'cigarette', 'vape', 'instagram filter', 'photo filter', 'camera filter', 'lens filter', 'snapchat',
        'aquaponics', 'hydroponics', 'hydroponic', 'irrigation', 'garden hose', 'hose filter', 'sprinkler',
        'stormwater', 'sewage', 'septic', 'greywater', 'grey water', 'blackwater', 'grease trap',
        'dust', 'smoke', 'kitchen exhaust']),
    'Unrelated plumbing & water services': (P, [
        'hot water', 'hot water system', 'hot water heater', 'water heater', 'heat pump', 'solar',
        'gas fitter', 'gas heater', 'gas leak', 'blocked drain', 'blocked drains', 'blocked toilet',
        'drain cleaning', 'burst pipe', 'leaking tap', 'toilet', 'toilets', 'cistern', 'roof', 'gutter', 'gutters', 'downpipe', 'water damage',
        'flood', 'mould', 'mold', 'pest control', 'water delivery', 'bottled water delivery',
        'water cartage', 'water truck', 'tank cleaning', 'water tank cleaning', 'water bill', 'water rates',
        'water meter', 'water restrictions', 'water outage', 'water main break', 
        'swimming', 'desalination', 'treatment plant', 'wastewater', 'municipal', 'council water',
        'mining', 'industrial', 'laboratory', 'lab test', 'dialysis', 'pharmaceutical', 'cooling tower',
        'boiler']),
    'Water testing (not offered)': (P, [
        'water test', 'water testing', 'water quality test', 'water quality testing', 'test my water',
        'water analysis', 'water sample', 'water testing kit', 'water test kit']),
    # 8 Oct 2026 search terms: ~$174 of Sydney's $313 went to cartridge shoppers, 0 conversions.
    # EXACT match: product searches only.
    'Cartridge shopping (product, not service)': (E, [
        'water filter cartridges', 'water filter cartridge', 'replacement water filter cartridges',
        'water filter replacement cartridge', 'water filter replacement cartridges',
        'water filters replacement cartridges', 'water cartridge filter', 'filter for water filter',
        'water filtration replacement filters', 'replacement water filter', 'replacement water filters',
        'water filter filters', 'whole house filter cartridge', 'whole house water filter cartridges']),
    # 8 Oct 2026: user chose to block every search containing replacement (installs focus).
    'Replacement searches': (P, ['replacement', 'replacements']),
    'Wellness gadgets & fads': (P, [
        'alkaline', 'alkaline water', 'ionizer', 'ioniser', 'ionized', 'hydrogen water', 'hydrogen',
        'structured water', 'kangen', 'tyent', 'alkaviva', 'zazen', 'enagic', 'vortex', 'magnetic',
        'shungite', 'structured', 'deuterium', 'energy water']),
    'Business & trade (not our customers)': (P, [
        'supplier', 'suppliers', 'distributor', 'distributors', 'manufacturer', 'manufacturers',
        'manufacturing', 'factory', 'oem', 'dealer', 'dealers', 'dealership', 'franchise', 'franchises',
        'business for sale', 'stockist', 'stockists', 'reseller', 'retailer', 'import', 'importer',
        'export', 'exporter', 'tender', 'tenders', 'asx', 'shares', 'stock price', 'annual report']),
    'Places we do not serve': (P, [
        'perth', 'western australia', 'melbourne', 'victoria', 'vic', 'brisbane', 'queensland', 'qld',
        'gold coast', 'sunshine coast', 'noosa', 'toowoomba', 'cairns', 'townsville', 'mackay', 'rockhampton',
        'bundaberg', 'hervey bay', 'adelaide', 'south australia', 'darwin', 'northern territory', 'alice springs',
        'hobart', 'launceston', 'tasmania', 'geelong', 'ballarat', 'bendigo', 'mildura', 'albury', 'wodonga',
        'wagga', 'wagga wagga', 'dubbo', 'bathurst', 'tamworth', 'armidale', 'port macquarie',
        'coffs harbour', 'lismore', 'byron bay', 'ballina', 'grafton', 'tweed heads', 'broken hill',
        'griffith', 'goulburn', 'nowra', 'batemans bay', 'bega', 'mandurah', 'bunbury', 'rockingham',
        'joondalup', 'fremantle', 'new zealand', 'nz', 'auckland', 'wellington', 'christchurch', 'uk',
        'united kingdom', 'london', 'usa', 'america', 'canada', 'india', 'singapore', 'malaysia', 'dubai',
        'philippines', 'south africa', 'ireland']),
    'Competitors (brand-only searches)': (P, [
        'filter systems australia', 'fsa filters', 'complete home filtration', 'chf filter', 'chf filters',
        'water analytics', 'waa water', 'clean and clear water', 'clean & clear water', 'cleanandclear',
        'waters co', 'watersco', 'great water filters', 'hydraflo', 'filpure', 'filtap', 'minthome',
        'mint home filtration', 'sunshine coast water filters', 'clarence water filters', 'west flow filtration',
        'westflow', 'urban future', 'dolphin home filtration', 'pure mains water', 'aquarius water filters',
        'neighbourhood water filtration', 'hilton plumbing', 'pure flow filtration',
        'pureflow', 'demand filtration', 'full house filtration', 'filtered beauty', 'awesome water',
        'aqua plus filtration', 'aquaco', 'aquaman', 'aquaport', 'aquasafe', 'aquasana', 'auswaterfilters',
        'bibo', 'bespoke water', 'purest water filtration', 'purple duck', 'safemains', 'summit filtration',
        'tryselene', 'selene water', 'aquaserve', 'inflow filter', 'tappwater', 'tapp water', 'carawater',
        'aquastream', 'cloudtap', 'filtermate', 'filtersforyou', 'waterfilter.au', 'waterfilter.com.au',
        'mywaterfilter', 'oz filter warehouse', 'discount fridge filters', 'water filter warehouse',
        'hydroflow', 'wellverti', 'watego', 'mineral stream', 'hydrochem', 'aqua clear industries',
        'thinkwater', 'membrane shop', 'centurion aprs', 'aquala', 'lords plumbing',
        'rose plumbing', 'network plumbing', 'salmon plumbing', 'wilco plumbing', 'collis bros',
        'irwins plumbing', 'atc plumbing', 'neverfail', 'aussie natural', 'novoh2o', 'novo h2o', 'smart h2o',
        'value h2o', 'aqua cooler direct', 'waterlogic', 'culligan', 'kinetico', 'pentair', 'davey',
        'waterco', 'stiebel eltron', 'insinkerator', 'uv guard', 'psi water filters', 'psi filters',
        'alps water filter', 'doulton', 'stefani', 'berkey', 'brita', 'philips water', 'waterdrop',
        'aquatru', 'sawyer', 'ecobud', 'kyn and folk', 'kyn & folk', '3m water', 'everpure', 'omnipure',
        'bluewater', 'lifesource', 'springwell', 'pelican water', 'apec', 'ispring', 'frizzlife', 'aquaphor',
        'ametek', 'puretech', 'pur water', 'zerowater', 'zero water', 'tupperware', 'nikken', 'amway',
        'espring', 'coway', 'cuckoo', 'kent ro', 'aquaguard', 'livpure', 'bestwater']),
    'Competitors (brand names that are ordinary words)': (E, [
        'pure water systems', 'pure water systems australia', 'filtered water solutions', 'water filters australia',
        'water filtration solutions', 'the water shop', 'water filters online', 'my water filter australia',
        'clear water filter australia', 'clear water filter melbourne', 'water filter distributors',
        'filter systems australia reviews', 'water analytics australia', 'great water filters australia']),
}

# Searches the business wants. None of these may be blocked.
PROTECTED = [
    'commercial water filter installation', 'water filter installation for cafe', 'office water filter installation',
    'restaurant water filtration', 'emergency water filter installation', 'same day water filter installation',
    'puretec installation', 'puretec water filter installation', 'zip tap installation', 'zip hydrotap installation',
    'billi tap installation', 'billi installation', 'aqua cooler installation', 'blue mountain water filter service',
    'shield water filter installation', 
    'replace water filter cartridges', 'my water filter is leaking',
    'water filter leaking under sink', 'water filter tap installation', 'filtered water tap installation',
    'reverse osmosis installation sydney', 'ro system installation', 'under sink water filter installation',
    'whole house water filter installation', 'whole house water filter cost', 'water filter installation cost',
    'water filter installation price', 'water filter installation reviews', 'best water filter installer sydney',
    'water filter plumber near me', 'licensed plumber water filter', 'water filters newcastle',
    'water filter installation newcastle', 'water filters wollongong', 'water filters central coast',
    'water filters canberra', 'water filter installation gosford', 'fluoride filter installation',
    'chlorine filter installation', 'sediment filter installation', 'mains water filter installation',
    'rainwater tank filter installation', 'tank water filter installation', 'water filter service near me',
    'water cooler installation', 'plumbed water cooler for office', 'water dispenser installation',
    'coffee machine water filter installation', 'ice maker water filter installation', 'rental property water filter',
    'hire plumber to install water filter', 'kitchen renovation filter tap', 'boil water notice filter',
    'crystal clear water filter', 'tea tastes bad water filter', 'orange water from tap filter',
    'water filter man near me', 'i think water filter is blocked',
]

SERVICE_AREA = ['sydney', 'newcastle', 'wollongong', 'central coast', 'canberra', 'act', 'nsw', 'gosford',
                'wyong', 'illawarra', 'hunter', 'parramatta', 'penrith', 'campbelltown', 'blue mountains',
                'lake macquarie', 'maitland', 'shellharbour', 'kiama', 'queanbeyan']


def tokens(s):
    return re.findall(r"[a-z0-9&.']+", s.lower())


def blocks(neg, match, query):
    n, q = tokens(neg), tokens(query)
    if match == E:
        return n == q
    if match == P:
        return any(q[i:i + len(n)] == n for i in range(len(q) - len(n) + 1))
    return all(w in q for w in n)


def positives():
    kws = set()
    for name in ('wfs-exact-campaigns.csv', 'wfs-additions.csv'):
        rows = csv.DictReader(open(os.path.join(HERE, name), encoding='utf-8-sig'))
        kws |= {r['Keyword'] for r in rows if r['Keyword']}
    return sorted(kws)


def main():
    pos = positives()
    flat, seen, problems = [], set(), []
    for cat, (match, terms) in NEGATIVES.items():
        for t in terms:
            key = (t.lower(), match)
            if key in seen:
                continue
            seen.add(key)
            flat.append((cat, t.lower(), match))
    for cat, t, m in flat:
        hit = [k for k in pos if blocks(t, m, k)]
        if hit:
            problems.append(f'blocks keyword {hit[:3]}: "{t}" ({cat})')
        hit = [k for k in PROTECTED if blocks(t, m, k)]
        if hit:
            problems.append(f'blocks protected search {hit[:3]}: "{t}" ({cat})')
        if any(blocks(t, P, a) or blocks(a, P, t) for a in SERVICE_AREA):
            problems.append(f'names a service area: "{t}" ({cat})')
    if problems:
        print('\n'.join(problems))
        sys.exit(f'{len(problems)} problem(s): fix the list before applying.')
    with open(os.path.join(HERE, 'negatives.csv'), 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        w.writerow(['Category', 'Negative keyword', 'Match type'])
        w.writerows(flat)
    print(f'{len(flat)} negatives, checked against {len(pos)} keywords and {len(PROTECTED)} protected searches: 0 conflicts')


if __name__ == '__main__':
    main()
