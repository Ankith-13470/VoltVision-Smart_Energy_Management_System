Simulator (backend)

This project includes a simple backend simulator used for development and demonstrations.

What it does
- Seeds `backend/sems_data.db` with hourly usage points from `backend/seed_data.csv` on startup (if present).
- Runs a lightweight simulator loop that appends synthetic hourly usage values every `SIM_INTERVAL` seconds (configured in `backend/main.py`).

Is it required?
- No. The simulator is only for local testing and demoing the UI when no live data source is connected.

How to disable
- Option A (recommended, runtime): Use the HTTP API added at `/simulator`.
  - GET `/simulator` returns `{ "enabled": true|false }`.
  - POST `/simulator` with JSON `{ "enabled": false }` will stop the simulator at runtime.

- Option B (code): Edit `backend/main.py` and set `simulator_enabled = False` near the top of the file before startup.

- Option C (remove): Stop the simulator thread by deleting or commenting out the thread start call in `startup()` (not recommended for casual use).

Notes
- When disabled at runtime the simulator stops generating new points but existing stored data remains in the database.
- Re-enabling via the API will restart the simulator thread.
