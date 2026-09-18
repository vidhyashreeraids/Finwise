import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFinancialPrediction } from "../utils/financialPrediction";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [stressLevel, setStressLevel] = useState("Analyzing...");
  const [loadingStress, setLoadingStress] = useState(false);

  // --------------------------------
  // Load transactions
  // --------------------------------
  useEffect(() => {
    const loadTransactions = () => {
      const savedTransactions = localStorage.getItem(
        "finwise_transactions"
      );

      if (!savedTransactions) {
        setTransactions([]);
        return;
      }

      try {
        const data = JSON.parse(savedTransactions);
        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading transactions:", error);
        setTransactions([]);
      }
    };

    loadTransactions();

    window.addEventListener("storage", loadTransactions);

    return () => {
      window.removeEventListener("storage", loadTransactions);
    };
  }, []);

  // --------------------------------
  // Load financial profile
  // --------------------------------
  const savedProfile =
    localStorage.getItem("finwise_profile");

  let profile = {};

  try {
    profile = savedProfile
      ? JSON.parse(savedProfile)
      : {};
  } catch (error) {
    console.error("Error loading profile:", error);
    profile = {};
  }

  // --------------------------------
  // Monthly income from Profile
  // --------------------------------
  const income =
    Number(profile.monthly_income) || 0;

  // --------------------------------
  // Transaction expenses
  // --------------------------------
  const transactionExpenses = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  // --------------------------------
  // Fixed monthly commitments
  // --------------------------------
  const rent =
    Number(profile.rent_or_mortgage) || 0;

  const loanPayment =
    Number(profile.loan_payment) || 0;

  const subscriptions =
    Number(profile.subscription_services) || 0;

  const fixedCommitments =
    rent +
    loanPayment +
    subscriptions;

  // --------------------------------
  // Total money spent
  // --------------------------------
  const expenses =
    transactionExpenses + fixedCommitments;

  // --------------------------------
  // Remaining money / savings
  // --------------------------------
  const savings =
    income - expenses;

  // --------------------------------
  // Savings rate
  // --------------------------------
  const savingsRate =
    income > 0
      ? ((savings / income) * 100).toFixed(1)
      : "0.0";

  // --------------------------------
  // Get ML prediction
  // --------------------------------
  useEffect(() => {
    const getStressPrediction = async () => {
      const savedProfile =
        localStorage.getItem("finwise_profile");

      if (!savedProfile) {
        setStressLevel("Complete Profile");
        return;
      }

      if (transactions.length === 0) {
        setStressLevel("Not enough data");
        return;
      }

      setLoadingStress(true);

      const result = await getFinancialPrediction();

      if (result.success) {
        setStressLevel(result.prediction || "Unknown");
      } else {
        console.error(result.message);
        setStressLevel("Unavailable");
      }

      setLoadingStress(false);
    };

    getStressPrediction();
  }, [transactions]);

  // --------------------------------
  // Format money
  // --------------------------------
  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // --------------------------------
  // Stress badge class
  // --------------------------------
  const getStressClass = () => {
    if (stressLevel === "Low") {
      return "stress-low";
    }

    if (stressLevel === "Medium") {
      return "stress-medium";
    }

    if (stressLevel === "High") {
      return "stress-high";
    }

    return "stress-neutral";
  };

  return (
    <div className="dashboard">

      <style>{`
        .dashboard {
          min-height: 100vh;
          display: flex;
          background: #f6f4ee;
          color: #1d2b26;
          font-family: Arial, sans-serif;
        }

        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: #1f4238;
          color: white;
          padding: 28px 18px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
        }

        .sidebar-logo {
          padding: 5px 12px 30px;
        }

        .sidebar-logo h1 {
          margin: 0;
          font-size: 27px;
        }

        .sidebar-logo span {
          display: block;
          margin-top: 5px;
          font-size: 12px;
          color: #c8d8d0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          text-decoration: none;
          color: #dce8e2;
          padding: 13px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          transition: 0.2s;
        }

        .nav-item:hover,
        .nav-item.active {
          background: #315d50;
          color: white;
        }

        .sidebar-bottom {
          margin-top: auto;
        }

        .logout-btn {
          display: block;
          text-align: center;
          padding: 11px;
          border-radius: 10px;
          text-decoration: none;
          color: #dce8e2;
          border: 1px solid #54776b;
          font-size: 13px;
        }

        .dashboard-main {
          margin-left: 240px;
          width: calc(100% - 240px);
          padding: 32px;
          box-sizing: border-box;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .dashboard-header h2 {
          margin: 0;
          color: #1f4238;
          font-size: 27px;
        }

        .dashboard-header p {
          margin: 6px 0 0;
          color: #748079;
          font-size: 14px;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #dce9df;
          color: #1f4238;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .user-profile strong {
          display: block;
          color: #1f4238;
          font-size: 14px;
        }

        .user-profile small {
          display: block;
          color: #7b8781;
          margin-top: 3px;
          font-size: 11px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e3dfd3;
          border-radius: 16px;
          padding: 21px;
          box-shadow: 0 7px 25px rgba(31, 66, 56, 0.05);
        }

        .stat-label {
          color: #7b8781;
          font-size: 12px;
        }

        .stat-card h3 {
          margin: 10px 0 6px;
          color: #1f4238;
          font-size: 23px;
        }

        .stat-card p {
          margin: 0;
          font-size: 12px;
        }

        .positive {
          color: #2d7955;
        }

        .negative {
          color: #b6574d;
        }

        .dashboard-card {
          background: white;
          border: 1px solid #e3dfd3;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 7px 25px rgba(31, 66, 56, 0.05);
        }

        .financial-stress-card {
          margin-bottom: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          margin: 0;
          color: #1f4238;
          font-size: 17px;
        }

        .card-header p {
          margin: 5px 0 0;
          color: #7a857f;
          font-size: 12px;
        }

        .card-header > span {
          font-size: 12px;
          color: #78837e;
        }

        .stress-content {
          margin-top: 22px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stress-badge {
          min-width: 100px;
          padding: 16px 22px;
          border-radius: 12px;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
        }

        .stress-low {
          background: #e3f1e6;
          color: #28734e;
        }

        .stress-medium {
          background: #fff1d7;
          color: #9a681d;
        }

        .stress-high {
          background: #f9e0dd;
          color: #a7473e;
        }

        .stress-neutral {
          background: #edf0ed;
          color: #66716c;
        }

        .stress-description {
          flex: 1;
        }

        .stress-description p {
          margin: 0;
          color: #66736c;
          font-size: 13px;
          line-height: 1.6;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .savings-content {
          margin-top: 22px;
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .savings-circle {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: #e8f0e9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .savings-circle strong {
          color: #1f4238;
          font-size: 22px;
        }

        .savings-circle span {
          margin-top: 3px;
          color: #77827c;
          font-size: 11px;
        }

        .savings-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .savings-details div {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .savings-details span {
          color: #78837e;
          font-size: 12px;
        }

        .savings-details strong {
          color: #1f4238;
          font-size: 13px;
        }

        .ai-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ai-title > span {
          font-size: 25px;
        }

        .ai-title h3 {
          margin: 0;
          color: #1f4238;
          font-size: 17px;
        }

        .ai-title p {
          margin: 5px 0 0;
          color: #7a857f;
          font-size: 12px;
        }

        .ai-message {
          margin-top: 22px;
          padding: 16px;
          border-radius: 11px;
          background: #f3f6f2;
          color: #617069;
          font-size: 13px;
          line-height: 1.6;
          min-height: 65px;
          box-sizing: border-box;
        }

        .ai-message p {
          margin: 0;
        }

        .ai-message strong {
          color: #1f4238;
        }

        .ai-link {
          display: inline-block;
          margin-top: 16px;
          color: #2f5d50;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }

        .transactions-card {
          margin-bottom: 30px;
        }

        .transactions-card .card-header a {
          color: #2f5d50;
          font-size: 12px;
          text-decoration: none;
          font-weight: 600;
        }

        .transaction-list {
          margin-top: 18px;
        }

        .transaction {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #eeeae0;
        }

        .transaction:last-child {
          border-bottom: none;
        }

        .transaction-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #eef3ef;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .transaction-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .transaction-info strong {
          color: #34443e;
          font-size: 13px;
        }

        .transaction-info span {
          color: #89928d;
          font-size: 11px;
        }

        .transaction > strong {
          font-size: 13px;
        }

        .income {
          color: #2d7955;
        }

        .expense {
          color: #b6574d;
        }

        .empty-transactions {
          text-align: center;
          padding: 30px;
          color: #78837e;
        }

        .empty-transactions div {
          font-size: 30px;
        }

        .empty-transactions h3 {
          margin: 10px 0 5px;
          color: #1f4238;
          font-size: 16px;
        }

        .empty-transactions p {
          margin: 0;
          font-size: 12px;
        }

        @media (max-width: 1000px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .sidebar {
            width: 70px;
            padding: 20px 8px;
          }

          .sidebar-logo h1 {
            font-size: 18px;
          }

          .sidebar-logo span,
          .nav-item span,
          .logout-btn {
            display: none;
          }

          .nav-item {
            justify-content: center;
            padding: 13px 5px;
          }

          .dashboard-main {
            margin-left: 70px;
            width: calc(100% - 70px);
            padding: 20px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            align-items: flex-start;
          }

          .user-profile {
            display: none;
          }

          .stress-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .savings-content {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <h1>FinWise</h1>
          <span>Financial Manager</span>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/dashboard"
            className="nav-item active"
          >
            🏠 <span>Home</span>
          </Link>

          <Link
            to="/transactions"
            className="nav-item"
          >
            💳 <span>Transactions</span>
          </Link>

          <Link
            to="/analytics"
            className="nav-item"
          >
            📊 <span>Analytics</span>
          </Link>

          <Link
            to="/goals"
            className="nav-item"
          >
            🎯 <span>Goals</span>
          </Link>

          <Link
            to="/ai"
            className="nav-item"
          >
            🤖 <span>AI Advisor</span>
          </Link>

          <Link
            to="/profile"
            className="nav-item"
          >
            👤 <span>Profile</span>
          </Link>

        </nav>

        <div className="sidebar-bottom">
          <Link to="/" className="logout-btn">
            Logout
          </Link>
        </div>

      </aside>

      {/* MAIN */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>
            <h2>Good morning 👋</h2>
            <p>Here's your financial overview</p>
          </div>

          <div className="user-profile">

            <div className="avatar">
              V
            </div>

            <div>
              <strong>Vidhyashree</strong>
              <small>Personal Account</small>
            </div>

          </div>

        </header>

        {/* STAT CARDS */}

        <section className="stats-grid">

          <div className="stat-card">
            <span className="stat-label">
              Total Income
            </span>

            <h3>{formatMoney(income)}</h3>

            <p className="positive">
              Money received
            </p>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Total Expenses
            </span>

            <h3>{formatMoney(expenses)}</h3>

            <p className="negative">
              Money spent
            </p>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Total Savings
            </span>

            <h3>{formatMoney(savings)}</h3>

            <p
              className={
                savings >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {savings >= 0
                ? "You're saving money"
                : "You're spending more than you earn"}
            </p>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Savings Rate
            </span>

            <h3>{savingsRate}%</h3>

            <p
              className={
                Number(savingsRate) >= 20
                  ? "positive"
                  : "negative"
              }
            >
              {Number(savingsRate) >= 20
                ? "Great savings!"
                : "Try saving more"}
            </p>
          </div>

        </section>

        {/* FINANCIAL STRESS */}

        <section className="dashboard-card financial-stress-card">

          <div className="card-header">

            <div>
              <h3>
                🧠 Financial Stress Analysis
              </h3>

              <p>
                ML prediction based on your profile
                and transaction activity
              </p>
            </div>

            {loadingStress && (
              <span>
                Analyzing...
              </span>
            )}

          </div>

          <div className="stress-content">

            <div
              className={`stress-badge ${getStressClass()}`}
            >
              {stressLevel}
            </div>

            <div className="stress-description">

              {stressLevel === "Low" && (
                <p>
                  🎉 Your current financial position
                  looks healthy. Keep maintaining your
                  savings habits.
                </p>
              )}

              {stressLevel === "Medium" && (
                <p>
                  ⚠️ Your finances show some signs of
                  stress. Consider reviewing your
                  expenses and savings.
                </p>
              )}

              {stressLevel === "High" && (
                <p>
                  🚨 Your financial situation may need
                  attention. Consider reducing
                  unnecessary expenses and reviewing
                  your budget.
                </p>
              )}

              {stressLevel === "Analyzing..." && (
                <p>
                  Analyzing your financial data...
                </p>
              )}

              {stressLevel === "Unavailable" && (
                <p>
                  Unable to connect to the financial
                  prediction service. Make sure the
                  ML server is running.
                </p>
              )}

              {stressLevel === "Not enough data" && (
                <p>
                  Add some income and expense
                  transactions to receive your
                  financial stress prediction.
                </p>
              )}

              {stressLevel === "Complete Profile" && (
                <p>
                  Please complete your Financial
                  Profile first so FinWise can make
                  a personalized prediction.
                </p>
              )}

              {stressLevel === "Unknown" && (
                <p>
                  The ML model returned an unknown
                  prediction.
                </p>
              )}

            </div>

          </div>

        </section>

        {/* SAVINGS + AI */}

        <section className="dashboard-grid">

          <div className="dashboard-card savings-card">

            <div className="card-header">

              <div>
                <h3>Savings</h3>
                <p>
                  Your current financial position
                </p>
              </div>

            </div>

            <div className="savings-content">

              <div className="savings-circle">
                <strong>
                  {savingsRate}%
                </strong>

                <span>
                  Saved
                </span>
              </div>

              <div className="savings-details">

                <div>
                  <span>Income</span>
                  <strong>
                    {formatMoney(income)}
                  </strong>
                </div>

                <div>
                  <span>Expenses</span>
                  <strong>
                    {formatMoney(expenses)}
                  </strong>
                </div>

                <div>
                  <span>Saved</span>
                  <strong>
                    {formatMoney(savings)}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          <div className="dashboard-card ai-card">

            <div className="ai-title">

              <span>🤖</span>

              <div>
                <h3>FinWise Insight</h3>
                <p>
                  Based on your spending
                </p>
              </div>

            </div>

            <div className="ai-message">

              {transactions.length === 0 && (
                <p>
                  Add some transactions and I'll
                  analyze your spending habits.
                </p>
              )}

              {transactions.length > 0 &&
                expenses === 0 && (
                  <p>
                    🎉 You haven't recorded any
                    expenses yet.
                  </p>
                )}

              {expenses > 0 &&
                savings >= 0 && (
                  <p>
                    You're currently saving{" "}
                    <strong>
                      {formatMoney(savings)}
                    </strong>
                    . Keep monitoring your expenses.
                  </p>
                )}

              {expenses > 0 &&
                savings < 0 && (
                  <p>
                    ⚠️ Your expenses are higher than
                    your income. Consider reviewing
                    your spending.
                  </p>
                )}

            </div>

            <Link
              to="/ai"
              className="ai-link"
            >
              View AI Insights →
            </Link>

          </div>

        </section>

        {/* RECENT TRANSACTIONS */}

        <section className="dashboard-card transactions-card">

          <div className="card-header">

            <div>
              <h3>Recent Transactions</h3>
              <p>
                Your latest financial activity
              </p>
            </div>

            <Link to="/transactions">
              View all →
            </Link>

          </div>

          <div className="transaction-list">

            {transactions.length === 0 ? (

              <div className="empty-transactions">

                <div>💰</div>

                <h3>
                  No transactions yet
                </h3>

                <p>
                  Add your first transaction
                  to see it here.
                </p>

              </div>

            ) : (

              transactions
                .slice(0, 5)
                .map((transaction) => (

                  <div
                    className="transaction"
                    key={transaction.id}
                  >

                    <div className="transaction-icon">
                      {transaction.type === "income"
                        ? "💼"
                        : "💳"}
                    </div>

                    <div className="transaction-info">

                      <strong>
                        {transaction.description}
                      </strong>

                      <span>
                        {transaction.category}
                      </span>

                    </div>

                    <strong
                      className={
                        transaction.type === "income"
                          ? "income"
                          : "expense"
                      }
                    >
                      {transaction.type === "income"
                        ? "+"
                        : "-"}

                      {formatMoney(
                        transaction.amount
                      )}
                    </strong>

                  </div>

                ))

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;