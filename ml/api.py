from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
from pathlib import Path

app = FastAPI(title="FinWise AI API")

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# MODEL PATH
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "financial_stress_model.joblib"

print("Looking for model at:", MODEL_PATH)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model file not found at: {MODEL_PATH}"
    )

model = joblib.load(MODEL_PATH)

print("Model loaded successfully!")


# --------------------------------------------------
# INPUT DATA
# --------------------------------------------------

class FinancialData(BaseModel):
    monthly_income: float
    monthly_expense_total: float
    savings_rate: float
    budget_goal: float
    financial_scenario: str
    credit_score: float
    debt_to_income_ratio: float
    loan_payment: float
    investment_amount: float
    subscription_services: int
    emergency_fund: float
    transaction_count: int
    fraud_flag: int
    discretionary_spending: float
    essential_spending: float
    income_type: str
    rent_or_mortgage: float
    category: str
    cash_flow_status: str
    financial_advice_score: float
    actual_savings: float


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "FinWise AI API is running!"
    }


# --------------------------------------------------
# PREDICT
# --------------------------------------------------

@app.post("/predict")
def predict(data: FinancialData):

    input_data = pd.DataFrame([{
        "monthly_income": data.monthly_income,
        "monthly_expense_total": data.monthly_expense_total,
        "savings_rate": data.savings_rate,
        "budget_goal": data.budget_goal,
        "financial_scenario": data.financial_scenario,
        "credit_score": data.credit_score,
        "debt_to_income_ratio": data.debt_to_income_ratio,
        "loan_payment": data.loan_payment,
        "investment_amount": data.investment_amount,
        "subscription_services": data.subscription_services,
        "emergency_fund": data.emergency_fund,
        "transaction_count": data.transaction_count,
        "fraud_flag": data.fraud_flag,
        "discretionary_spending": data.discretionary_spending,
        "essential_spending": data.essential_spending,
        "income_type": data.income_type,
        "rent_or_mortgage": data.rent_or_mortgage,
        "category": data.category,
        "cash_flow_status": data.cash_flow_status,
        "financial_advice_score": data.financial_advice_score,
        "actual_savings": data.actual_savings
    }])

    prediction = model.predict(input_data)

    return {
        "financial_stress_level": str(prediction[0])
    }