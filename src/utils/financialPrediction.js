export async function getFinancialPrediction() {
  try {
    // ==========================================
    // 1. GET USER PROFILE
    // ==========================================

    const savedProfile = localStorage.getItem("finwise_profile");

    if (!savedProfile) {
      return {
        success: false,
        message: "Please complete your financial profile first.",
      };
    }

    const profile = JSON.parse(savedProfile);

    // These values MUST come from the user.
    const requiredFields = [
      "monthly_income",
      "budget_goal",
      "credit_score",
      "debt_to_income_ratio",
      "loan_payment",
      "investment_amount",
      "subscription_services",
      "emergency_fund",
      "rent_or_mortgage",
      "income_type",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        profile[field] === undefined ||
        profile[field] === null ||
        profile[field] === ""
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        message:
          "Please complete all financial profile details before getting an ML prediction.",
        missingFields,
      };
    }

    // ==========================================
    // 2. GET ACTUAL TRANSACTIONS
    // ==========================================

    const savedTransactions =
      localStorage.getItem("finwise_transactions");

    let transactions = [];

    if (savedTransactions) {
      try {
        transactions = JSON.parse(savedTransactions);
      } catch (error) {
        console.error("Transaction data error:", error);

        return {
          success: false,
          message: "Unable to read your transaction data.",
        };
      }
    }

    // ==========================================
    // 3. SEPARATE INCOME & EXPENSES
    // ==========================================

    const incomeTransactions = transactions.filter(
      (transaction) => transaction.type === "income"
    );

    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === "expense"
    );

    // ==========================================
    // 4. CALCULATE ACTUAL TRANSACTION VALUES
    // ==========================================

    const transactionIncome = incomeTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

    const transactionExpenses = expenseTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

    // Profile income is the user's declared monthly income.
    const monthlyIncome = Number(profile.monthly_income);

    // Actual expenses come from transactions.
    const monthlyExpenses = transactionExpenses;

    // ==========================================
    // 5. CALCULATE SAVINGS
    // ==========================================

    const actualSavings = monthlyIncome - monthlyExpenses;

    const savingsRate =
      monthlyIncome > 0
        ? actualSavings / monthlyIncome
        : 0;

    // ==========================================
    // 6. CALCULATE ESSENTIAL & DISCRETIONARY
    // ==========================================

    /*
      Dataset categories:
      Rent
      Groceries
      Utilities
      Healthcare
      Transportation
      Education
      Insurance
      Dining Out
      Entertainment
      Investments
    */

    const essentialCategories = [
      "Rent",
      "Groceries",
      "Utilities",
      "Healthcare",
      "Transportation",
      "Education",
      "Insurance",
    ];

    const essentialSpending = expenseTransactions
      .filter((transaction) =>
        essentialCategories.includes(transaction.category)
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );

    const discretionarySpending = Math.max(
      monthlyExpenses - essentialSpending,
      0
    );

    // ==========================================
    // 7. CALCULATE CASH FLOW STATUS
    // ==========================================

    let cashFlowStatus;

    if (actualSavings > 0) {
      cashFlowStatus = "Positive";
    } else if (actualSavings < 0) {
      cashFlowStatus = "Negative";
    } else {
      cashFlowStatus = "Neutral";
    }

    // ==========================================
    // 8. DETERMINE FINANCIAL SCENARIO
    // ==========================================

    /*
      The dataset uses:
      normal
      inflation
      recession

      Since the user does not currently enter
      the economic scenario in Profile, we derive
      a conservative scenario from spending pressure.

      This is NOT an arbitrary constant.
    */

    let financialScenario = "normal";

    const expenseRatio =
      monthlyIncome > 0
        ? monthlyExpenses / monthlyIncome
        : 0;

    if (expenseRatio >= 1.2) {
      financialScenario = "recession";
    } else if (expenseRatio >= 0.9) {
      financialScenario = "inflation";
    }

    // ==========================================
    // 9. CALCULATE FINANCIAL ADVICE SCORE
    // ==========================================

    /*
      Dataset range:
      0.1 - 100

      We calculate the score from the user's
      actual financial situation.
    */

    let adviceScore = 50;

    // Savings contribution
    if (savingsRate >= 0.30) {
      adviceScore += 25;
    } else if (savingsRate >= 0.20) {
      adviceScore += 15;
    } else if (savingsRate >= 0.10) {
      adviceScore += 5;
    } else if (savingsRate < 0) {
      adviceScore -= 25;
    }

    // Debt contribution
    const debtRatio =
      Number(profile.debt_to_income_ratio);

    if (debtRatio <= 0.20) {
      adviceScore += 10;
    } else if (debtRatio >= 0.50) {
      adviceScore -= 15;
    }

    // Emergency fund contribution
    const emergencyFund =
      Number(profile.emergency_fund);

    const monthlyIncomeValue =
      Number(profile.monthly_income);

    if (
      emergencyFund >=
      monthlyIncomeValue * 3
    ) {
      adviceScore += 10;
    } else if (
      emergencyFund <
      monthlyIncomeValue
    ) {
      adviceScore -= 10;
    }

    // Credit score contribution
    const creditScore =
      Number(profile.credit_score);

    if (creditScore >= 750) {
      adviceScore += 5;
    } else if (creditScore < 600) {
      adviceScore -= 10;
    }

    // Keep within dataset range
    adviceScore = Math.min(
      Math.max(adviceScore, 0.1),
      100
    );

    // ==========================================
    // 10. CATEGORY
    // ==========================================

    /*
      The dataset contains individual categories.
      For an overall financial prediction, we use
      the user's highest-spending category when
      available.
    */

    const categorySpending = {};

expenseTransactions.forEach((transaction) => {
  const category = transaction.category;

  if (category) {
    categorySpending[category] =
      (categorySpending[category] || 0) +
      Number(transaction.amount || 0);
  }
});

let appCategory = "Food";

const categoryEntries = Object.entries(categorySpending);

if (categoryEntries.length > 0) {
  appCategory = categoryEntries.sort(
    (a, b) => b[1] - a[1]
  )[0][0];
}

// Convert FinWise categories → ML dataset categories
const categoryMap = {
  Food: "Dining Out",
  Travel: "Transportation",
  Health: "Healthcare",
  Bills: "Utilities",
  Shopping: "Groceries",
  Education: "Education",
  Entertainment: "Entertainment",
  Other: "Groceries",
};

const category = categoryMap[appCategory] || "Groceries";

    // ==========================================
    // 11. FRAUD FLAG
    // ==========================================

    /*
      Dataset uses 0 / 1.

      We don't invent fraud detection here.
      Unless your transaction system has a fraud
      detector, the correct value is 0.
    */

    const fraudFlag = transactions.some(
      (transaction) =>
        transaction.fraud_flag === 1 ||
        transaction.fraud_flag === true
    )
      ? 1
      : 0;

    // ==========================================
    // 12. PREPARE ML INPUT
    // ==========================================

    const mlData = {
      monthly_income: monthlyIncome,

      monthly_expense_total: monthlyExpenses,

      savings_rate: savingsRate,

      budget_goal: Number(profile.budget_goal),

      financial_scenario: financialScenario,

      credit_score: creditScore,

      debt_to_income_ratio: debtRatio,

      loan_payment: Number(profile.loan_payment),

      investment_amount: Number(
        profile.investment_amount
      ),

      subscription_services: Number(
        profile.subscription_services
      ),

      emergency_fund: emergencyFund,

      transaction_count: transactions.length,

      fraud_flag: fraudFlag,

      discretionary_spending:
        discretionarySpending,

      essential_spending:
        essentialSpending,

      income_type: profile.income_type,

      rent_or_mortgage: Number(
        profile.rent_or_mortgage
      ),

      category: category,

      cash_flow_status: cashFlowStatus,

      financial_advice_score: adviceScore,

      actual_savings: actualSavings,
    };

    // ==========================================
    // 13. SHOW EXACT DATA SENT TO ML
    // ==========================================

    console.log(
      "================================"
    );

    console.log(
      "FINWISE → ML INPUT"
    );

    console.table(mlData);

    console.log(
      "================================"
    );

    // ==========================================
    // 14. CALL FASTAPI ML MODEL
    // ==========================================

    const response = await fetch(
      "http://127.0.0.1:8000/predict",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(mlData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `ML API error ${response.status}: ${errorText}`
      );
    }

    const result = await response.json();

    // ==========================================
    // 15. RETURN REAL ML PREDICTION
    // ==========================================

    console.log(
      "FINWISE ML PREDICTION:",
      result
    );

    return {
      success: true,

      prediction:
        result.financial_stress_level,

      data: mlData,
    };
  } catch (error) {
    console.error(
      "Financial prediction error:",
      error
    );

    return {
      success: false,

      message:
        "Unable to connect to the Financial Stress ML model.",

      error: error.message,
    };
  }
}