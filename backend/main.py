# backend/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import threading, time, sqlite3, os, random, math
from datetime import datetime, timedelta
try:
    import pandas as pd
except Exception:
    pd = None
# Use lightweight numpy-based fallbacks instead of scikit-learn
try:
    from sklearn.ensemble import IsolationForest  # noqa: F401
    from sklearn.linear_model import LinearRegression  # noqa: F401
    SKLEARN_AVAILABLE = True
except Exception:
    IsolationForest = None
    LinearRegression = None
    SKLEARN_AVAILABLE = False

DB = "sems_data.db"
SIM_INTERVAL = 3  # seconds for demo
# Keep simulator running far into the future for demos
END_TIMESTAMP = datetime(2099, 1, 1, 23)

# Simulator control state
simulator_enabled = True
simulator_stop_event = threading.Event()
simulator_thread = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    clear_data_db()
    seed = os.path.join(os.path.dirname(__file__), "seed_data.csv")
    if os.path.exists(seed):
        try:
            if pd is not None:
                df = pd.read_csv(seed)
                for _, r in df.iterrows():
                    insert_point(str(r.get('time')), float(r.get('usage')))
            else:
                import csv
                with open(seed, newline='', encoding='utf-8') as fh:
                    reader = csv.DictReader(fh)
                    for r in reader:
                        insert_point(str(r.get('time')), float(r.get('usage')))
        except Exception as e:
            print("Seed load error:", e)
    train_models()
    if simulator_enabled:
        start_simulator()
    try:
        yield
    finally:
        stop_simulator()

app = FastAPI(title="SEMS Backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB helpers
def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS usage (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 ts TEXT,
                 usage REAL
                 )""")
    conn.commit()
    conn.close()

def insert_point(ts, usage):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("INSERT INTO usage (ts, usage) VALUES (?,?)", (ts, float(usage)))
    conn.commit()
    conn.close()

def fetch_latest(n=200):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT ts, usage FROM usage ORDER BY id DESC LIMIT ?", (n,))
    rows = c.fetchall()
    conn.close()
    rows.reverse()
    return [{"time": r[0], "usage": r[1]} for r in rows]

def fetch_all(limit=10000):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT ts, usage FROM usage ORDER BY id ASC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [{"time": r[0], "usage": r[1]} for r in rows]

# Models
model_lock = threading.Lock()
# forecast_model will be a tuple (slope, intercept) when sklearn unavailable
forecast_model = None
# anomaly_model will be dict with mean/std when sklearn unavailable
anomaly_model = None

def train_models():
    global forecast_model, anomaly_model
    recs = fetch_all(limit=2000)
    if len(recs) < 10:
        return
    import numpy as _np
    # Build numeric arrays
    y = _np.array([r['usage'] for r in recs], dtype=float)
    t = _np.arange(len(recs), dtype=float)

    if SKLEARN_AVAILABLE:
        # prefer sklearn if present
        X = t.reshape(-1, 1)
        lr = LinearRegression()
        lr.fit(X, y)
        iso = IsolationForest(contamination=0.02, random_state=42)
        iso.fit(y.reshape(-1, 1))
        with model_lock:
            forecast_model = lr
            anomaly_model = iso
    else:
        # fallback: simple linear regression via polyfit and z-score anomaly detector
        slope, intercept = _np.polyfit(t, y, 1)
        mean = float(y.mean())
        std = float(y.std()) if y.size > 1 else 0.0
        with model_lock:
            forecast_model = (float(slope), float(intercept))
            anomaly_model = {"mean": mean, "std": std, "threshold": 3.0}

def predict_next():
    with model_lock:
        if forecast_model is None:
            return None
        total = len(fetch_all())
        if SKLEARN_AVAILABLE:
            pred = forecast_model.predict([[total]])[0]
            return float(pred)
        else:
            slope, intercept = forecast_model
            return float(slope * total + intercept)

def detect_anomalies():
    with model_lock:
        recs = fetch_all(limit=2000)
        if not recs or anomaly_model is None:
            return []
        import numpy as _np
        if SKLEARN_AVAILABLE:
            if pd is not None:
                df = pd.DataFrame(recs)
                preds = anomaly_model.predict(df[['usage']].values)
                df['is_anom'] = preds == -1
                anoms = df[df['is_anom']]
                return anoms.tail(200).to_dict(orient='records')
            else:
                vals = _np.array([r['usage'] for r in recs], dtype=float).reshape(-1,1)
                preds = anomaly_model.predict(vals)
                anoms = [r for r,p in zip(recs, preds) if p == -1]
                return anoms[-200:]
        else:
            vals = _np.array([r['usage'] for r in recs], dtype=float)
            mean = anomaly_model.get('mean', float(vals.mean()))
            std = anomaly_model.get('std', float(vals.std()))
            thr = anomaly_model.get('threshold', 3.0)
            mask = _np.abs(vals - mean) > thr * std if std > 0 else _np.zeros_like(vals, dtype=bool)
            anoms = [r for r,m in zip(recs, mask) if m]
            return anoms[-200:]

# Simulator
def generate_point(last_ts=None, last_val=None):
    if last_ts:
        next_ts = datetime.fromisoformat(last_ts) + timedelta(hours=1)
    else:
        next_ts = datetime.utcnow()
    if next_ts > END_TIMESTAMP:
        return None, None

    hour = next_ts.hour
    base = 1200.0
    amplitude = 400.0
    spike_prob = 0.02

    # Daily load profile: quieter overnight, stronger during daytime and early evening.
    if 6 <= hour < 10:
        trend = 1.05
    elif 10 <= hour < 16:
        trend = 1.25
    elif 16 <= hour < 20:
        trend = 1.1
    else:
        trend = 0.85

    cycle = base + amplitude * math.sin(2 * math.pi * (hour - 15) / 24)
    val = cycle * trend
    val += val * ((random.random() - 0.5) * 0.08)

    if last_val is not None:
        val = 0.8 * val + 0.2 * last_val

    if random.random() < spike_prob:
        val += random.uniform(50, 180)

    val = max(0.0, min(val, 2000.0))
    return next_ts.isoformat(), round(float(val), 2)

def simulator_loop():
    # Runs until stop event is set or simulator_enabled becomes False
    while not simulator_stop_event.is_set() and simulator_enabled:
        try:
            latest = fetch_latest(1)
            last_ts = latest[-1]['time'] if latest else None
            last_val = latest[-1]['usage'] if latest else None
            ts, val = generate_point(last_ts, last_val)
            if ts is None:
                print("Simulator reached end timestamp; stopping simulator loop.")
                break
            insert_point(ts, val)
            train_models()
        except Exception as e:
            print("Simulator error:", e)
        # sleep in small increments so stop can be responsive
        for _ in range(int(max(1, SIM_INTERVAL))):
            if simulator_stop_event.is_set() or not simulator_enabled:
                break
            time.sleep(1)


def start_simulator():
    global simulator_thread, simulator_stop_event, simulator_enabled
    if simulator_thread and simulator_thread.is_alive():
        return
    simulator_stop_event.clear()
    simulator_enabled = True
    simulator_thread = threading.Thread(target=simulator_loop, daemon=True)
    simulator_thread.start()


def stop_simulator():
    global simulator_thread, simulator_stop_event, simulator_enabled
    simulator_enabled = False
    simulator_stop_event.set()
    if simulator_thread and simulator_thread.is_alive():
        simulator_thread.join(timeout=2)
    simulator_thread = None

# API models
class Ingest(BaseModel):
    time: str
    usage: float

def clear_data_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("DELETE FROM usage")
    conn.commit()
    conn.close()

@app.get("/usage")
def get_usage(limit: int = 200):
    return fetch_latest(limit)

@app.get("/history")
def get_history(limit: int = 10000):
    return fetch_all(limit)

@app.post("/ingest")
def ingest_point(payload: Ingest):
    insert_point(payload.time, payload.usage)
    train_models()
    return {"status":"ok"}

@app.get("/predict")
def get_predict():
    p = predict_next()
    if p is None:
        raise HTTPException(status_code=503, detail="Model not ready")
    return {"predicted_usage": round(p,2)}

@app.get("/anomaly")
def get_anomaly():
    return detect_anomalies()

@app.post("/clear")
def clear_data():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("DELETE FROM usage")
    conn.commit()
    conn.close()
    return {"status":"cleared"}


class SimulatorToggle(BaseModel):
    enabled: bool


@app.get("/simulator")
def get_simulator_status():
    return {"enabled": bool(simulator_enabled)}


@app.post("/simulator")
def set_simulator_status(payload: SimulatorToggle):
    try:
        if payload.enabled:
            start_simulator()
        else:
            stop_simulator()
        return {"enabled": bool(payload.enabled)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
