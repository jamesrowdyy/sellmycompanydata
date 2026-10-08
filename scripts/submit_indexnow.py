"""Notify IndexNow of published sitemap URLs. This does not guarantee indexing."""
from pathlib import Path
import json
import urllib.request
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
key=(ROOT/'indexnow-key.txt').read_text().strip()
key_url='https://sellmycompanydata.com/indexnow-key.txt'
# Verify the public ownership key is deployed before requesting discovery.
with urllib.request.urlopen(key_url,timeout=20) as response:
    assert response.read().decode().strip()==key, 'Public IndexNow key is not deployed yet'
urls=[e.text for e in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
assert urls and all(u.startswith('https://sellmycompanydata.com/') for u in urls)
payload={'host':'sellmycompanydata.com','key':key,'keyLocation':key_url,'urlList':urls}
req=urllib.request.Request('https://api.indexnow.org/indexnow',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json; charset=utf-8'},method='POST')
with urllib.request.urlopen(req,timeout=30) as response:
    print(json.dumps({'status':response.status,'submitted_urls':urls,'note':'Submission accepted; indexing is not guaranteed.'}))
