export function analyzeTransactions(transactions) {
  const incomeTransactions = transactions.filter(
    (transaction) => transaction.type === "income"
  );

  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense"
  );

  const totalIncome = incomeTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount),
    0
  );

  const totalExpenses = expenseTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount),
    0
  );

  const savings = totalIncome - totalExpenses;

  const savingsRate =
    totalIncome > 0
      ? (savings / totalIncome) * 100
      : 0;

  // -----------------------------
  // CATEGORY ANALYSIS
  // -----------------------------

  const categoryTotals = {};

  expenseTransactions.forEach((transaction) => {
    const category = transaction.category;

    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }

    categoryTotals[category] += Number(
      transaction.amount
    );
  });

  const categoryBreakdown = Object.entries(
    categoryTotals
  )
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const highestCategory =
    categoryBreakdown.length > 0
      ? categoryBreakdown[0]
      : null;

  // -----------------------------
  // AVERAGE EXPENSE
  // -----------------------------

  const averageExpense =
    expenseTransactions.length > 0
      ? totalExpenses / expenseTransactions.length
      : 0;

  // -----------------------------
  // FINANCIAL HEALTH
  // -----------------------------

  let financialHealth = "Needs Attention";

  if (savingsRate >= 30) {
    financialHealth = "Excellent";
  } else if (savingsRate >= 20) {
    financialHealth = "Good";
  } else if (savingsRate >= 10) {
    financialHealth = "Fair";
  }

  return {
    totalIncome,
    totalExpenses,
    savings,
    savingsRate,
    categoryBreakdown,
    highestCategory,
    averageExpense,
    transactionCount: transactions.length,
    financialHealth,
  };
}