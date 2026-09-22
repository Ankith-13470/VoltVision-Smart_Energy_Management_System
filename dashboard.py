import streamlit as st, pandas as pd, requests

st.title("Smart Energy Management System(SEMS)")

usage = requests.get("http://127.0.0.1:8000/usage").json()
df = pd.DataFrame(usage)
st.line_chart(df["Electricity Consumption (kWh)"])

pred = requests.get("http://127.0.0.1:8000/predict").json()
st.metric("Predicted Next Hour Usage", pred["predicted_usage"])

st.warning("Turn off fans when not in use!")
st.success("Awareness campaign: Save 15% energy this week!")
