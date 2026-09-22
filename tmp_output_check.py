import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

path = r'd:\SEMS\Ankith_CleanedDataset_with_percapita.csv'
df = pd.read_csv(path)
X = np.arange(len(df)).reshape(-1, 1)
y = df['Electricity Consumption (kWh)'].values
model = LinearRegression().fit(X, y)
next_val = model.predict(np.array([[len(df)]]))[0]
print({'predicted_usage': round(float(next_val), 2), 'target_col': 'Electricity Consumption (kWh)'})
print(df.tail(10).to_dict(orient='records'))
