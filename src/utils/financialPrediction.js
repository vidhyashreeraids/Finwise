export async function getFinancialPrediction() {
  try {
    // ==========================================
    // 1. GET USER PROFILE
    // ==========================================

    const savedProfile =
      localStorage.getItem("finwise_profile");

    if (!savedProfile) {
      return {
        success: false,
        message:
          "Please complete your financial profile first.",
      };
    }

    const profile = JSON.parse(savedProfile);

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
    // 2. GET TRANSACTIONS
    // ==========================================

    const savedTransactions =
      localStorage.getItem("finwise_transactions");

    let transactions = [];

    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);

        transactions = Array.isArray(parsed)
          ? parsed
          : [];
      } catch (error) {
        console.error(
          "Transaction data error:",
          error
        );

        return {
          success: false,
          message:
            "Unable to read your transaction data.",
        };
      }
    }

    // ==========================================
    // 3. SEPARATE INCOME AND EXPENSES
    // ==========================================

    const incomeTransactions =
      transactions.filter(
        (transaction) =>
          transaction.type === "income"
      );

    const expenseTransactions =
      transactions.filter(
        (transaction) =>
          transaction.type === "expense"
      );

    // ==========================================
    // 4. TRANSACTION INCOME
    // ==========================================

    const transactionIncome =
      incomeTransactions.reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );

    // ==========================================
    // 5. TRANSACTION EXPENSES
    // ==========================================

    const transactionExpenses =
      expenseTransactions.reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );

    // ==========================================
    // 6. TOTAL MONTHLY INCOME
    // ==========================================

    const profileIncome =
      Number(profile.monthly_income) || 0;

    /*
      Profile income
      +
      Income transactions
      =
      Current total income
    */

    const monthlyIncome =
      profileIncome + transactionIncome;

    // ==========================================
    // 7. FIXED EXPENSES
    // ==========================================

    const rent =
      Number(profile.rent_or_mortgage) || 0;

    const loan =
      Number(profile.loan_payment) || 0;

    const subscriptions =
      Number(
        profile.subscription_services
      ) || 0;

    const fixedExpenses =
      rent +
      loan +
      subscriptions;

    // ==========================================
    // 8. TOTAL MONTHLY EXPENSES
    // ==========================================

    const monthlyExpenses =
      transactionExpenses +
      fixedExpenses;

    // ==========================================
    // 9. ACTUAL SAVINGS
    // ==========================================

    const actualSavings =
      monthlyIncome -
      monthlyExpenses;

    // ==========================================
    // 10. SAVINGS RATE
    // ==========================================

    const savingsRate =
      monthlyIncome > 0
        ? actualSavings / monthlyIncome
        : 0;

    // ==========================================
    // 11. ESSENTIAL & DISCRETIONARY SPENDING
    // ==========================================

    const essentialCategories = [
      "Rent",
      "Groceries",
      "Utilities",
      "Healthcare",
      "Transportation",
      "Education",
      "Insurance",
    ];

    const transactionEssentialSpending =
      expenseTransactions
        .filter((transaction) =>
          essentialCategories.includes(
            transaction.category
          )
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0
        );

    const essentialSpending =
      transactionEssentialSpending +
      rent +
      loan;

    const discretionarySpending =
      Math.max(
        monthlyExpenses -
          essentialSpending,
        0
      );

    // ==========================================
    // 12. CASH FLOW STATUS
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
    // 13. FINANCIAL SCENARIO
    // ==========================================

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
    // 14. FINANCIAL ADVICE SCORE
    // ==========================================

    let adviceScore = 50;

    if (savingsRate >= 0.30) {
      adviceScore += 25;
    } else if (savingsRate >= 0.20) {
      adviceScore += 15;
    } else if (savingsRate >= 0.10) {
      adviceScore += 5;
    } else if (savingsRate < 0) {
      adviceScore -= 25;
    }

    // ==========================================
    // 15. DEBT RATIO
    // ==========================================

    const debtRatio =
      Number(
        profile.debt_to_income_ratio
      );

    if (debtRatio <= 0.20) {
      adviceScore += 10;
    } else if (debtRatio >= 0.50) {
      adviceScore -= 15;
    }

    // ==========================================
    // 16. EMERGENCY FUND
    // ==========================================

    const emergencyFund =
      Number(profile.emergency_fund);

    if (
      emergencyFund >=
      monthlyIncome * 3
    ) {
      adviceScore += 10;
    } else if (
      emergencyFund < monthlyIncome
    ) {
      adviceScore -= 10;
    }

    // ==========================================
    // 17. CREDIT SCORE
    // ==========================================

    const creditScore =
      Number(profile.credit_score);

    if (creditScore >= 750) {
      adviceScore += 5;
    } else if (creditScore < 600) {
      adviceScore -= 10;
    }

    adviceScore = Math.min(
      Math.max(adviceScore, 0.1),
      100
    );

    // ==========================================
    // 18. CATEGORY
    // ==========================================

    const categorySpending = {};

    expenseTransactions.forEach(
      (transaction) => {
        const category =
          transaction.category;

        if (category) {
          categorySpending[category] =
            (categorySpending[category] || 0) +
            Number(transaction.amount || 0);
        }
      }
    );

    let appCategory = "Food";

    const categoryEntries =
      Object.entries(categorySpending);

    if (categoryEntries.length > 0) {
      appCategory =
        categoryEntries.sort(
          (a, b) => b[1] - a[1]
        )[0][0];
    }

    // ==========================================
    // 19. CATEGORY MAPPING
    // ==========================================

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

    const category =
      categoryMap[appCategory] ||
      "Groceries";

    // ==========================================
    // 20. FRAUD FLAG
    // ==========================================

    const fraudFlag =
      transactions.some(
        (transaction) =>
          transaction.fraud_flag === 1 ||
          transaction.fraud_flag === true
      )
        ? 1
        : 0;

    // ==========================================
    // 21. PREPARE ML INPUT
    // ==========================================

    const mlData = {
      monthly_income: monthlyIncome,

      monthly_expense_total:
        monthlyExpenses,

      savings_rate:
        savingsRate,

      budget_goal:
        Number(profile.budget_goal),

      financial_scenario:
        financialScenario,

      credit_score:
        creditScore,

      debt_to_income_ratio:
        debtRatio,

      loan_payment:
        Number(profile.loan_payment),

      investment_amount:
        Number(
          profile.investment_amount
        ),

      subscription_services:
        Number(
          profile.subscription_services
        ),

      emergency_fund:
        emergencyFund,

      transaction_count:
        transactions.length,

      fraud_flag:
        fraudFlag,

      discretionary_spending:
        discretionarySpending,

      essential_spending:
        essentialSpending,

      income_type:
        profile.income_type,

      rent_or_mortgage:
        Number(
          profile.rent_or_mortgage
        ),

      category:
        category,

      cash_flow_status:
        cashFlowStatus,

      financial_advice_score:
        adviceScore,

      actual_savings:
        actualSavings,
    };

    // ==========================================
    // 22. DEBUG ML INPUT
    // ==========================================

    console.log(
      "================================"
    );

    console.log(
      "FINWISE → ML INPUT"
    );

    console.table(mlData);

    console.log(
      "PROFILE INCOME:",
      profileIncome
    );

    console.log(
      "TRANSACTION INCOME:",
      transactionIncome
    );

    console.log(
      "TOTAL ML INCOME:",
      monthlyIncome
    );

    console.log(
      "TOTAL ML EXPENSES:",
      monthlyExpenses
    );

    console.log(
      "ML SAVINGS:",
      actualSavings
    );

    console.log(
      "ML SAVINGS RATE:",
      savingsRate
    );

    console.log(
      "================================"
    );

    // ==========================================
    // 23. CALL FASTAPI
    // ==========================================

    const response =
      await fetch(
        "https://finwise-ml-ibgx.onrender.com/predict",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            mlData
          ),
        }
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `ML API error ${response.status}: ${errorText}`
      );
    }

    const result =
      await response.json();

    // ==========================================
    // 24. RETURN ML PREDICTION
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