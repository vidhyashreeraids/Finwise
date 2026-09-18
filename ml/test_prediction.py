from predict import predict_stress

data = {
    "monthly_income": 50000,
    "monthly_expense_total": 35000,
    "savings_rate": 0.20,
    "budget_goal": 30000,
    "financial_scenario": "normal",
    "credit_score": 720,
    "debt_to_income_ratio": 0.25,
    "loan_payment": 5000,
    "investment_amount": 5000,
    "subscription_services": 3,
    "emergency_fund": 100000,
    "transaction_count": 50,
    "fraud_flag": 0,
    "discretionary_spending": 8000,
    "essential_spending": 27000,
    "income_type": "Salary",
    "rent_or_mortgage": 15000,
    "category": "Groceries",
    "cash_flow_status": "Positive",
    "financial_advice_score": 70,
    "actual_savings": 10000
}

result = predict_stress(data)

print("Predicted Financial Stress Level:", result)