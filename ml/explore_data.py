import pandas as pd

# Load dataset
df = pd.read_csv("data/finance.csv")

print("\n===== FIRST 5 ROWS =====")
print(df.head())

print("\n===== DATASET SHAPE =====")
print(df.shape)

print("\n===== COLUMN NAMES =====")
print(df.columns.tolist())

print("\n===== DATA TYPES =====")
print(df.dtypes)

print("\n===== MISSING VALUES =====")
print(df.isnull().sum())

print("\n===== DUPLICATES =====")
print(df.duplicated().sum())

print("\n===== STATISTICS =====")
print(df.describe())

print("\n===== UNIQUE VALUES =====")
for column in df.columns:
    print(f"\n{column}:")
    print(df[column].unique()[:10])