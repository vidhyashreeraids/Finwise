import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# ==========================================
# 1. LOAD DATASET
# ==========================================

df = pd.read_csv("data/finance.csv")

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)


# ==========================================
# 2. SELECT FEATURES AND TARGET
# ==========================================

features = [
    "monthly_income",
    "monthly_expense_total",
    "savings_rate",
    "budget_goal",
    "credit_score",
    "debt_to_income_ratio",
    "loan_payment",
    "investment_amount",
    "subscription_services",
    "emergency_fund",
    "transaction_count",
    "discretionary_spending",
    "essential_spending",
    "income_type",
    "rent_or_mortgage",
    "actual_savings",
    "financial_scenario"
]

target = "financial_stress_level"


# Check that all required columns exist
required_columns = features + [target]

missing_columns = [
    column for column in required_columns
    if column not in df.columns
]

if missing_columns:
    print("\nERROR: The following columns are missing from the dataset:")
    for column in missing_columns:
        print("-", column)
    raise ValueError("Dataset columns do not match the training code.")


X = df[features]
y = df[target]


# ==========================================
# 3. IDENTIFY COLUMN TYPES
# ==========================================

numeric_features = [
    "monthly_income",
    "monthly_expense_total",
    "savings_rate",
    "budget_goal",
    "credit_score",
    "debt_to_income_ratio",
    "loan_payment",
    "investment_amount",
    "subscription_services",
    "emergency_fund",
    "transaction_count",
    "discretionary_spending",
    "essential_spending",
    "rent_or_mortgage",
    "actual_savings"
]

categorical_features = [
    "income_type",
    "financial_scenario"
]


# ==========================================
# 4. PREPROCESSING
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            StandardScaler(),
            numeric_features
        ),
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ]
)


# ==========================================
# 5. CREATE RANDOM FOREST MODEL
# ==========================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)


# ==========================================
# 6. CREATE COMPLETE PIPELINE
# ==========================================

pipeline = Pipeline(
    steps=[
        ("preprocessing", preprocessor),
        ("model", model)
    ]
)


# ==========================================
# 7. TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# 8. TRAIN MODEL
# ==========================================

print("\nTraining model...")

pipeline.fit(X_train, y_train)

print("Training completed successfully!")


# ==========================================
# 9. MAKE PREDICTIONS
# ==========================================

print("\nMaking predictions...")

y_pred = pipeline.predict(X_test)

print("Predictions completed!")


# ==========================================
# 10. EVALUATE MODEL
# ==========================================

accuracy = accuracy_score(y_test, y_pred)

print("\n==========================================")
print("           MODEL PERFORMANCE")
print("==========================================")

print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# ==========================================
# 11. SAVE TRAINED MODEL
# ==========================================

model_path = "financial_stress_model.joblib"

joblib.dump(
    pipeline,
    model_path
)

print("\n==========================================")
print("MODEL SAVED SUCCESSFULLY!")
print("==========================================")
print(f"File: {model_path}")