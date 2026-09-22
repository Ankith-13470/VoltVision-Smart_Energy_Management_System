import sqlite3
from datetime import datetime

conn = sqlite3.connect('sems_data.db')
c = conn.cursor()

c.execute("SELECT COUNT(*) FROM usage")
count = c.fetchone()[0]

c.execute("SELECT MIN(ts), MAX(ts) FROM usage")
minmax = c.fetchone()

c.execute("SELECT id, ts, usage FROM usage ORDER BY id DESC LIMIT 10")
rows = c.fetchall()
conn.close()

print('rows_count:', count)
print('min_ts, max_ts:', minmax)
print('latest 10:')
for r in rows:
    print(r)
