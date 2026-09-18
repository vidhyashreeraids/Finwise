import joblib
import pandas as pd

MODEL_PATH = "financial_stress_model.joblib"

model = joblib.load(MODEL_PATH)


def predict_stress(data):
    df = pd.DataFrame([data])

    prediction = model.predict(df)[0]

    return prediction