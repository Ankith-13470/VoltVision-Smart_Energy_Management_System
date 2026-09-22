"""prepare_hourly_seed.py

Pure-Python replacement to generate hourly seed data from Energy_Data.csv
avoiding pandas so it runs under environments where compiled extensions are blocked.
"""
import csv
import math
import random
from datetime import datetime, timedelta
import calendar
from pathlib import Path

IN = "Energy_Data.csv"
OUT = "backend/seed_data.csv"
year = 2026

month_map = {"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12}

rows = []
with open(IN, newline='', encoding='utf-8') as fh:
    reader = csv.DictReader(fh)
    for r in reader:
        mon = (r.get('Month') or '').strip()[:3]
        if not mon:
            continue
        m = month_map.get(mon, 1)
        try:
            monthly_kwh = float(r.get('Electricity Consumption (kWh)', 0))
        except Exception:
            monthly_kwh = 0.0
        days = calendar.monthrange(year, m)[1]
        hours = days * 24
        avg_hour = monthly_kwh / hours if hours else 0
        start = datetime(year, m, 1)
        end_date = datetime(2026, 7, 20, 23)
        for h in range(hours):
            ts = start + timedelta(hours=h)
            if ts > end_date:
                break
            hour_of_day = ts.hour
            cycle = 1 + 0.35 * math.sin(2 * math.pi * (hour_of_day - 14) / 24)
            noise = random.gauss(0, 0.06)
            val = max(0, avg_hour * cycle * (1 + noise))
            rows.append({'time': ts.isoformat(), 'usage': f"{val:.3f}"})

Path(OUT).parent.mkdir(parents=True, exist_ok=True)
with open(OUT, 'w', newline='', encoding='utf-8') as outfh:
    writer = csv.DictWriter(outfh, fieldnames=['time', 'usage'])
    writer.writeheader()
    writer.writerows(rows)

print("Wrote", OUT, "rows:", len(rows))
