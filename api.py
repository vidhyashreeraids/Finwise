from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ==========================================
# 1. CREATE FASTAPI APP
# ==========================================

app = FastAPI(
    title="FinWise AI API",
    description="Financial stress prediction API",
    version="1.0.0"
)


# ==========================================
# 2. ALLOW REACT FRONTEND TO CONNECT
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 3. LOAD TRAINED MODEL
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "financial_stress_model.joblib"

model = joblib.load(MODEL_PATH)

print("FinWise ML model loaded successfully!")


# ==========================================
# 4. DEFINE USER INPUT
# ==========================================

class FinancialData(BaseModel):

    monthly_income: float
    monthly_expense_total: float
    savings_rate: float
    budget_goal: float
    credit_score: float
    debt_to_income_ratio: float
    loan_payment: float
    investment_amount: float
    subscription_services: float
    emergency_fund: float
    transaction_count: float
    discretionary_spending: float
    essential_spending: float
    income_type: str
    rent_or_mortgage: float
    actual_savings: float
    financial_scenario: str


# ==========================================
# 5. HOME ENDPOINT
# ==========================================

@app.get("/")
def home():

    return {
        "message": "FinWise AI API is running!",
        "status": "success"
    }


# ==========================================
# 6. PREDICTION ENDPOINT
# ==========================================

@app.post("/predict")
def predict_financial_stress(data: FinancialData):

    # Convert user input into DataFrame
    user_data = pd.DataFrame([data.model_dump()])

    # Make prediction
    prediction = model.predict(user_data)[0]

    # Get prediction probabilities
    probabilities = model.predict_proba(user_data)[0]

    # Get class names
    classes = model.classes_

    probability_dict = {
        str(class_name): round(float(probability) * 100, 2)
        for class_name, probability in zip(classes, probabilities)
    }

    return {
        "financial_stress_level": str(prediction),
        "probabilities": probability_dict
    }