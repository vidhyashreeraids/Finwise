import { Link } from "react-router-dom";

function Analytics() {
  const saved = localStorage.getItem("finwise_transactions");

  let transactions = [];

  if (saved) {
    try {
      transactions = JSON.parse(saved);
    } catch {
      transactions = [];
    }
  }

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const savings = income - expenses;

  const savingsRate =
    income > 0 ? Math.round((savings / income) * 100) : 0;

  const expenseRate =
    income > 0 ? Math.round((expenses / income) * 100) : 0;

  const formatMoney = (amount) => {
    return "Rs. " + amount.toLocaleString("en-IN");
  };

  const categoryTotals = {};

  transactions
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      const category = item.category || "Other";

      categoryTotals[category] =
        (categoryTotals[category] || 0) +
        Number(item.amount || 0);
    });

  const categories = Object.keys(categoryTotals);

  const sortedCategories = [...categories].sort(
    (a, b) => categoryTotals[b] - categoryTotals[a]
  );

  const biggestCategory =
    sortedCategories.length > 0
      ? sortedCategories[0]
      : "None";

  return (
    <div className="analytics-page">

      {/* SIDEBAR */}

      <aside className="analytics-sidebar">

        <div className="analytics-logo">
          <div className="logo-icon">F</div>

          <div>
            <h2>FinWise</h2>
            <span>Smart Finance</span>
          </div>
        </div>

        <nav className="analytics-nav">

          <Link to="/dashboard">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link to="/transactions">
            <span>↔</span>
            Transactions
          </Link>

          <Link
            to="/analytics"
            className="analytics-active"
          >
            <span>◈</span>
            Analytics
          </Link>

          <Link to="/goals">
            <span>◎</span>
            Goals
          </Link>

          <Link to="/ai">
            <span>✦</span>
            AI Advisor
          </Link>

          <Link to="/profile">
            <span>◯</span>
            Profile
          </Link>

        </nav>

        <Link
          to="/"
          className="analytics-logout"
        >
          Logout
        </Link>

      </aside>

      {/* MAIN */}

      <main className="analytics-main">

        {/* HEADER */}

        <header className="analytics-header">

          <div>
            <h1>Analytics</h1>

            <p>
              Understand your money. Improve your future.
            </p>
          </div>

          <div className="analytics-date">
            <span>Current period</span>
            <strong>This Month</strong>
          </div>

        </header>

        {/* SUMMARY CARDS */}

        <section className="analytics-summary">

          <div className="analytics-card income-card">

            <div className="card-icon">
              ↑
            </div>

            <div>
              <span>Total Income</span>

              <h2>
                {formatMoney(income)}
              </h2>

              <small>
                Money received
              </small>
            </div>

          </div>

          <div className="analytics-card expense-card">

            <div className="card-icon">
              ↓
            </div>

            <div>
              <span>Total Expenses</span>

              <h2>
                {formatMoney(expenses)}
              </h2>

              <small>
                {expenseRate}% of income
              </small>
            </div>

          </div>

          <div className="analytics-card savings-card">

            <div className="card-icon">
              $
            </div>

            <div>
              <span>Total Savings</span>

              <h2>
                {formatMoney(savings)}
              </h2>

              <small>
                {savingsRate}% savings rate
              </small>
            </div>

          </div>

        </section>

        {/* FINANCIAL OVERVIEW */}

        <section className="analytics-panel">

          <div className="panel-header">

            <div>
              <h2>Financial Overview</h2>

              <p>
                Your income compared with spending
              </p>
            </div>

          </div>

          <div className="financial-bars">

            <div className="financial-row">

              <div className="financial-label">
                <span>Income</span>
                <strong>
                  {formatMoney(income)}
                </strong>
              </div>

              <div className="financial-track">

                <div
                  className="financial-income"
                  style={{
                    width: income > 0 ? "100%" : "0%",
                  }}
                />

              </div>

            </div>

            <div className="financial-row">

              <div className="financial-label">
                <span>Expenses</span>
                <strong>
                  {formatMoney(expenses)}
                </strong>
              </div>

              <div className="financial-track">

                <div
                  className="financial-expense"
                  style={{
                    width:
                      income > 0
                        ? Math.min(
                            (expenses / income) * 100,
                            100
                          ) + "%"
                        : "0%",
                  }}
                />

              </div>

            </div>

            <div className="financial-row">

              <div className="financial-label">
                <span>Savings</span>
                <strong>
                  {formatMoney(savings)}
                </strong>
              </div>

              <div className="financial-track">

                <div
                  className="financial-savings"
                  style={{
                    width:
                      income > 0 && savings > 0
                        ? Math.min(
                            (savings / income) * 100,
                            100
                          ) + "%"
                        : "0%",
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* SPENDING */}

        <section className="analytics-panel">

          <div className="panel-header">

            <div>
              <h2>Spending Breakdown</h2>

              <p>
                See where your money is going
              </p>
            </div>

            <Link to="/transactions">
              View Transactions →
            </Link>

          </div>

          {categories.length === 0 ? (

            <div className="analytics-empty">

              <div>📊</div>

              <h3>No spending data yet</h3>

              <p>
                Add expenses from Transactions to
                see your spending breakdown.
              </p>

            </div>

          ) : (

            <div className="category-list">

              {sortedCategories.map((category) => {

                const amount =
                  categoryTotals[category];

                const percentage =
                  expenses > 0
                    ? Math.round(
                        (amount / expenses) * 100
                      )
                    : 0;

                return (
                  <div
                    className="category-row"
                    key={category}
                  >

                    <div className="category-name">
                      <div className="category-dot" />

                      <span>
                        {category}
                      </span>
                    </div>

                    <div className="category-progress">

                      <div
                        style={{
                          width:
                            percentage + "%",
                        }}
                      />

                    </div>

                    <strong>
                      {formatMoney(amount)}
                    </strong>

                    <span className="category-percent">
                      {percentage}%
                    </span>

                  </div>
                );
              })}

            </div>

          )}

        </section>

        {/* INSIGHT */}

        <section className="ai-insight">

          <div className="ai-insight-icon">
            ✦
          </div>

          <div>

            <span>FINWISE INSIGHT</span>

            <h3>
              {biggestCategory === "None"
                ? "Start tracking your expenses"
                : `${biggestCategory} is your highest spending category`}
            </h3>

            <p>
              {biggestCategory === "None"
                ? "Add transactions and FinWise will identify patterns in your spending."
                : `You have spent ${formatMoney(
                    categoryTotals[biggestCategory]
                  )} on ${biggestCategory}. Reviewing this category could help you save more.`}
            </p>

          </div>

          <Link to="/ai">
            Get AI Advice →
          </Link>

        </section>

      </main>

    </div>
  );
}

export default Analytics;