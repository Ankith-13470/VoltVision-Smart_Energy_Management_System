import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest

path = r'D:\SEMS\backend\Energy_Data.csv'

df = pd.read_csv(path)

target_col = "Electricity Consumption (kWh)"

X = np.arange(len(df)).reshape(-1,1)
y = df[target_col].values
model = LinearRegression().fit(X,y)

next_val = model.predict(np.array([[len(df)]]))[0]
print('predict endpoint:', {'predicted_usage': round(float(next_val),2), 'target_col': target_col})

iso = IsolationForest(contamination=0.1).fit(df[target_col].values.reshape(-1,1))
preds = iso.predict(df[target_col].values.reshape(-1,1))
anoms = df[preds==-1]
print('anomalies:', anoms.tail(5).to_dict(orient='records'))

avg_usage = df[target_col].mean()
latest = df[target_col].iloc[-1]
tip = '⚡ Usage is high. Switch off unused appliances!' if latest>avg_usage*1.2 else '✅ Energy usage is within safe limits.'
print('recommend:', {'tip': tip})

print('usage tail 5:', df.tail(5).to_dict(orient='records'))
