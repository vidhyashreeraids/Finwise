import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState({});

  const loadData = () => {
    try {
      const savedTransactions =
        localStorage.getItem("finwise_transactions");

      const savedProfile =
        localStorage.getItem("finwise_profile");

      const parsedTransactions = savedTransactions
        ? JSON.parse(savedTransactions)
        : [];

      const parsedProfile = savedProfile
        ? JSON.parse(savedProfile)
        : {};

      setTransactions(
        Array.isArray(parsedTransactions)
          ? parsedTransactions
          : []
      );

      setProfile(
        parsedProfile &&
          typeof parsedProfile === "object"
          ? parsedProfile
          : {}
      );
    } catch (error) {
      console.error("Analytics data error:", error);
      setTransactions([]);
      setProfile({});
    }
  };

  useEffect(() => {
    loadData();

    window.addEventListener("storage", loadData);
    window.addEventListener(
      "finwise_transactions_updated",
      loadData
    );
    window.addEventListener("focus", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener(
        "finwise_transactions_updated",
        loadData
      );
      window.removeEventListener("focus", loadData);
    };
  }, []);

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // DEFAULT INCOME + TRANSACTION INCOME
  const income = useMemo(() => {
    const defaultIncome =
      Number(profile.monthly_income) || 0;

    const transactionIncome = transactions
      .filter((t) => t.type === "income")
      .reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );

    return defaultIncome + transactionIncome;
  }, [transactions, profile]);

  const expenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );
  }, [transactions]);

  const savings = income - expenses;

  const savingsRate =
    income > 0
      ? ((savings / income) * 100).toFixed(1)
      : "0.0";

  const categoryData = useMemo(() => {
    const data = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const category =
          transaction.category || "Other";

        data[category] =
          (data[category] || 0) +
          Number(transaction.amount || 0);
      });

    return Object.entries(data).sort(
      (a, b) => b[1] - a[1]
    );
  }, [transactions]);

  const highestCategory =
    categoryData.length > 0
      ? categoryData[0]
      : null;

  const expensePercentage =
    income > 0
      ? ((expenses / income) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="finwise-layout">

      {/* SIDEBAR */}
      <aside className="finwise-sidebar">

        <div className="finwise-logo">
          <h2>FinWise</h2>
          <span>
            AI Financial Coach
          </span>
        </div>

        <nav className="finwise-nav">

          <Link to="/dashboard">
            ⌂ Dashboard
          </Link>

          <Link to="/transactions">
            ↔ Transactions
          </Link>

          <Link
            to="/analytics"
            className="nav-active"
          >
            ◔ Analytics
          </Link>

          <Link to="/goals">
            ◎ Goals
          </Link>

          <Link to="/ai">
            ✦ AI Advisor
          </Link>

          <Link to="/profile">
            ♙ Profile
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-tip">
            <span>📊</span>

            <p>
              Understand your spending
              patterns and improve your
              savings.
            </p>
          </div>

        </div>

      </aside>

      {/* MAIN */}
      <main className="finwise-main">

        {/* HEADER */}
        <header className="page-header">

          <div>

            <p className="page-label">
              FINANCIAL INSIGHTS
            </p>

            <h1>
              Analytics
            </h1>

            <p className="page-description">
              Understand your spending
              patterns and financial health.
            </p>

          </div>

          <Link
            to="/transactions"
            className="royal-button"
          >
            + Add Transaction
          </Link>

        </header>

        {/* TOP STAT CARDS */}
        <section className="analytics-stats">

          <div className="analytics-stat-card">

            <div className="analytics-stat-top">
              <span>
                TOTAL INCOME
              </span>

              <div className="analytics-icon green">
                ↗
              </div>
            </div>

            <h2>
              {formatMoney(income)}
            </h2>

            <p>
              Money received
            </p>

          </div>

          <div className="analytics-stat-card">

            <div className="analytics-stat-top">
              <span>
                TOTAL EXPENSES
              </span>

              <div className="analytics-icon red">
                ↘
              </div>
            </div>

            <h2>
              {formatMoney(expenses)}
            </h2>

            <p>
              Money spent
            </p>

          </div>

          <div className="analytics-stat-card">

            <div className="analytics-stat-top">
              <span>
                SAVINGS
              </span>

              <div className="analytics-icon green">
                ₹
              </div>
            </div>

            <h2
              className={
                savings >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {formatMoney(savings)}
            </h2>

            <p>
              Income minus expenses
            </p>

          </div>

          <div className="analytics-stat-card">

            <div className="analytics-stat-top">
              <span>
                SAVINGS RATE
              </span>

              <div className="analytics-icon green">
                %
              </div>
            </div>

            <h2>
              {savingsRate}%
            </h2>

            <p>
              Of your income
            </p>

          </div>

        </section>

        {/* MAIN ANALYTICS GRID */}
        <section className="analytics-grid">

          {/* SPENDING OVERVIEW */}
          <div className="analytics-card spending-card">

            <div className="analytics-card-header">

              <div>
                <p className="page-label">
                  OVERVIEW
                </p>

                <h2>
                  Spending Overview
                </h2>
              </div>

              <span className="chart-badge">
                {expensePercentage}% of income
              </span>

            </div>

            <div className="spending-visual">

              <div className="spending-circle">

                <div>
                  <strong>
                    {formatMoney(expenses)}
                  </strong>

                  <span>
                    spent
                  </span>
                </div>

              </div>

              <div className="spending-details">

                <div>
                  <span>
                    Income
                  </span>

                  <strong className="positive">
                    {formatMoney(income)}
                  </strong>
                </div>

                <div>
                  <span>
                    Expenses
                  </span>

                  <strong className="negative">
                    {formatMoney(expenses)}
                  </strong>
                </div>

                <div>
                  <span>
                    Remaining
                  </span>

                  <strong>
                    {formatMoney(savings)}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          {/* SAVINGS RATE */}
          <div className="analytics-card savings-card">

            <div className="analytics-card-header">

              <div>
                <p className="page-label">
                  SAVINGS
                </p>

                <h2>
                  Savings Rate
                </h2>
              </div>

              <span className="chart-badge">
                Monthly
              </span>

            </div>

            <div className="savings-big">
              {savingsRate}%
            </div>

            <div className="progress-container">

              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(
                    Math.max(
                      Number(savingsRate),
                      0
                    ),
                    100
                  )}%`,
                }}
              />

            </div>

            <p className="savings-message">

              {savings < 0
                ? "Your expenses are higher than your income."
                : Number(savingsRate) >= 20
                ? "Good progress! Keep building your savings."
                : "Try gradually increasing your monthly savings."}

            </p>

          </div>

        </section>

        {/* CATEGORY + TOP SPENDING */}
        <section className="analytics-grid">

          {/* CATEGORY BREAKDOWN */}
          <div className="analytics-card">

            <div className="analytics-card-header">

              <div>
                <p className="page-label">
                  BREAKDOWN
                </p>

                <h2>
                  Expense Categories
                </h2>
              </div>

            </div>

            {categoryData.length === 0 ? (

              <div className="analytics-empty">
                <span>📊</span>

                <h3>
                  No expense data yet
                </h3>

                <p>
                  Add expenses to see
                  your spending breakdown.
                </p>
              </div>

            ) : (

              <div className="category-list">

                {categoryData.map(
                  ([category, amount]) => {

                    const percentage =
                      expenses > 0
                        ? (amount /
                            expenses) *
                          100
                        : 0;

                    return (
                      <div
                        className="category-row"
                        key={category}
                      >

                        <div className="category-info">

                          <span>
                            {category}
                          </span>

                          <strong>
                            {formatMoney(amount)}
                          </strong>

                        </div>

                        <div className="category-progress">

                          <div
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                        <span className="category-percent">
                          {percentage.toFixed(0)}%
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

          {/* TOP SPENDING */}
          <div className="analytics-card">

            <div className="analytics-card-header">

              <div>
                <p className="page-label">
                  INSIGHT
                </p>

                <h2>
                  Top Spending
                </h2>
              </div>

            </div>

            {highestCategory ? (

              <div className="top-spending">

                <div className="top-spending-icon">
                  ₹
                </div>

                <p>
                  Your highest spending
                  category is
                </p>

                <h1>
                  {highestCategory[0]}
                </h1>

                <strong>
                  {formatMoney(
                    highestCategory[1]
                  )}
                </strong>

                <span>
                  {expenses > 0
                    ? `${(
                        (highestCategory[1] /
                          expenses) *
                        100
                      ).toFixed(1)}% of your total expenses`
                    : ""}
                </span>

              </div>

            ) : (

              <div className="analytics-empty">
                <span>💡</span>

                <h3>
                  No spending insight yet
                </h3>

                <p>
                  Add some expenses to
                  generate insights.
                </p>
              </div>

            )}

          </div>

        </section>

        {/* AI INSIGHT */}
        <section className="ai-insight-box">

          <div className="ai-insight-icon">
            ✦
          </div>

          <div>

            <p className="page-label">
              FINWISE INSIGHT
            </p>

            <h2>
              Your Financial Snapshot
            </h2>

            <p>

              {transactions.length === 0
                ? "Start adding transactions to receive personalized financial insights."
                : savings < 0
                ? `Your expenses exceed your recorded income by ${formatMoney(
                    Math.abs(savings)
                  )}. Reviewing your largest spending categories may help you understand where your money is going.`
                : highestCategory
                ? `${highestCategory[0]} is currently your largest expense category at ${formatMoney(
                    highestCategory[1]
                  )}. You are currently saving ${savingsRate}% of your recorded income.`
                : `You currently have a savings rate of ${savingsRate}%. Keep tracking your transactions to understand your financial patterns.`}

            </p>

          </div>

        </section>

      </main>
    </div>
  );
}

export default Analytics;