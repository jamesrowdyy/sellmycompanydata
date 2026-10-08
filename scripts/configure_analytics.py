"""Apply public provider identifiers and Search Console verification to the site.
Usage: python scripts/configure_analytics.py /path/to/public-identifiers.json
No personal API keys, service-account credentials or access tokens belong here.
"""
import html
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
keys = {'ga4MeasurementId', 'posthogProjectToken', 'posthogHost', 'googleSiteVerification'}
data = json.loads(Path(sys.argv[1]).read_text())
if not isinstance(data, dict) or set(data) - keys:
    raise SystemExit('Only the four documented public configuration fields are accepted.')
p = ROOT / 'analytics-config.js'
existing = json.loads(re.search(r'Object.freeze\((\{.*?\})\)', p.read_text(), re.S).group(1))
for key in keys - {'googleSiteVerification'}:
    if key in data:
        existing[key] = data[key]
for key,pattern in [('ga4MeasurementId', r'G-[A-Z0-9]+'), ('posthogProjectToken', r'phc_[A-Za-z0-9_-]+'), ('googleSiteVerification', r'[A-Za-z0-9_-]+')]:
    value = data.get(key, existing.get(key, ''))
    if not isinstance(value, str) or (value and not re.fullmatch(pattern,value)):
        raise SystemExit('Invalid public identifier: ' + key)
if existing['posthogHost'] not in ['https://us.i.posthog.com','https://eu.i.posthog.com']:
    raise SystemExit('Use the PostHog US or EU ingestion host matching your project.')
p.write_text('/* Public website identifiers only; never add personal API keys. */\nwindow.SMCD_ANALYTICS_CONFIG = Object.freeze(' + json.dumps(existing,indent=2) + ');\n')
if 'googleSiteVerification' in data:
    home = ROOT / 'index.html';s = home.read_text()
    s = re.sub(r'<meta name="google-site-verification"[^>]*>\s*','',s)
    if data['googleSiteVerification']:
        s = s.replace('</head>', '<meta name="google-site-verification" content="' + html.escape(data['googleSiteVerification'],quote=True) + '">\n</head>')
    home.write_text(s)
print('Public identifiers applied. Deploy, then verify provider ingestion and property ownership.')
