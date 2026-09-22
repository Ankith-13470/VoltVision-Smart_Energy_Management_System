import csv, json, urllib.request, os
url='http://127.0.0.1:8000/ingest'
count=0

# Open seed file relative to this script's directory so the script works
# when invoked from the repo root or elsewhere.
seed_path = os.path.join(os.path.dirname(__file__), 'seed_data.csv')
with open(seed_path, newline='', encoding='utf-8') as fh:
    reader=csv.DictReader(fh)
    for r in reader:
        payload = json.dumps({"time": r['time'], "usage": float(r['usage'])}).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type':'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                resp.read()
            count+=1
        except Exception as e:
            print('ERR', e)
print('Posted', count, 'points')
