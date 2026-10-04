import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getFinancialPrediction } from "../utils/financialPrediction";
import "./Dashboard.css";

function Dashboard() {
  // =====================================================
  // STATE
  // =====================================================

  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState({});

  const [stressLevel, setStressLevel] =
    useState("Analyzing...");

  const [loadingStress, setLoadingStress] =
    useState(false);

  const [predictionError, setPredictionError] =
    useState("");


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    const loadData = () => {
      try {
        const savedTransactions =
          localStorage.getItem(
            "finwise_transactions"
          );

        const savedProfile =
          localStorage.getItem(
            "finwise_profile"
          );

        setTransactions(
          savedTransactions
            ? JSON.parse(savedTransactions)
            : []
        );

        setProfile(
          savedProfile
            ? JSON.parse(savedProfile)
            : {}
        );
      } catch (error) {
        console.error(
          "Dashboard data error:",
          error
        );

        setTransactions([]);
        setProfile({});
      }
    };

    loadData();

    window.addEventListener(
      "storage",
      loadData
    );

    window.addEventListener(
      "finwise_transactions_updated",
      loadData
    );

    window.addEventListener(
      "focus",
      loadData
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadData
      );

      window.removeEventListener(
        "finwise_transactions_updated",
        loadData
      );

      window.removeEventListener(
        "focus",
        loadData
      );
    };
  }, []);


  // =====================================================
  // FINANCIAL CALCULATIONS
  // =====================================================

  const financialData = useMemo(() => {

    // DEFAULT MONTHLY INCOME
    const profileIncome =
      Number(profile.monthly_income) || 0;

    // INCOME TRANSACTIONS
    const transactionIncome =
      transactions
        .filter(
          (transaction) =>
            transaction.type === "income"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0
        );

    // EXPENSE TRANSACTIONS
    const transactionExpenses =
      transactions
        .filter(
          (transaction) =>
            transaction.type === "expense"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0
        );

    // DEFAULT INCOME + TRANSACTION INCOME
    const income =
      profileIncome + transactionIncome;

    const rent =
      Number(
        profile.rent_or_mortgage
      ) || 0;

    const loan =
      Number(
        profile.loan_payment
      ) || 0;

    const subscriptions =
      Number(
        profile.subscription_services
      ) || 0;

    const fixedExpenses =
      rent +
      loan +
      subscriptions;

    const expenses =
      transactionExpenses +
      fixedExpenses;

    const savings =
      income - expenses;

    const savingsRate =
      income > 0
        ? (savings / income) * 100
        : 0;

    return {
      income,
      expenses,
      savings,
      savingsRate,
      profileIncome,
      transactionIncome,
      transactionExpenses,
      fixedExpenses,
    };

  }, [transactions, profile]);


  // =====================================================
  // ML FINANCIAL STRESS PREDICTION
  // =====================================================

  useEffect(() => {
    const predictFinancialStress =
      async () => {

        const savedProfile =
          localStorage.getItem(
            "finwise_profile"
          );

        if (!savedProfile) {
          setStressLevel(
            "Complete Profile"
          );
          return;
        }

        if (transactions.length === 0) {
          setStressLevel(
            "Not enough data"
          );
          return;
        }

        setLoadingStress(true);
        setPredictionError("");

        try {
          const result =
            await getFinancialPrediction();

          console.log(
            "FinWise ML Prediction:",
            result
          );

          if (result?.success) {
            setStressLevel(
              result.prediction ||
                "Unknown"
            );
          } else {
            setStressLevel(
              "Unavailable"
            );

            setPredictionError(
              result?.message ||
                "Unable to get ML prediction."
            );
          }
        } catch (error) {
          console.error(
            "Financial stress prediction error:",
            error
          );

          setStressLevel(
            "Unavailable"
          );

          setPredictionError(
            "Could not connect to the ML server."
          );
        } finally {
          setLoadingStress(false);
        }
      };

    predictFinancialStress();

  }, [transactions, profile]);


  // =====================================================
  // HELPERS
  // =====================================================

  const formatMoney = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };


  const userName =
    profile.name ||
    profile.full_name ||
    "there";


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


  const getStressIcon = () => {
    if (stressLevel === "Low") {
      return "✓";
    }

    if (stressLevel === "Medium") {
      return "!";
    }

    if (stressLevel === "High") {
      return "⚠";
    }

    return "•";
  };


  const getStressMessage = () => {
    if (stressLevel === "Low") {
      return "Your current financial pattern shows a low level of financial stress.";
    }

    if (stressLevel === "Medium") {
      return "Your financial pattern indicates a moderate level of stress. Review your spending and savings.";
    }

    if (stressLevel === "High") {
      return "Your financial pattern indicates a high level of stress. Consider reviewing major expenses and financial commitments.";
    }

    if (stressLevel === "Not enough data") {
      return "Add some transactions to allow FinWise AI to analyze your financial pattern.";
    }

    if (stressLevel === "Complete Profile") {
      return "Complete your financial profile to generate your AI prediction.";
    }

    if (stressLevel === "Unavailable") {
      return predictionError;
    }

    return "FinWise AI is analyzing your financial data.";
  };


  // =====================================================
  // RECENT TRANSACTIONS
  // =====================================================

  const recentTransactions =
    transactions.slice(0, 5);


  return (
    <div className="finwise-dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="finwise-sidebar">

        <div className="finwise-logo">

          <div className="logo-box">
            F
          </div>

          <div>

            <h2>
              FinWise
            </h2>

            <span>
              SMART FINANCE
            </span>

          </div>

        </div>


        <nav className="finwise-nav">

          <Link
            to="/dashboard"
            className="nav-link active"
          >

            <span className="nav-icon">
              🏠
            </span>

            <span>
              Home
            </span>

          </Link>


          <Link
            to="/transactions"
            className="nav-link"
          >

            <span className="nav-icon">
              💳
            </span>

            <span>
              Transactions
            </span>

          </Link>


          <Link
            to="/analytics"
            className="nav-link"
          >

            <span className="nav-icon">
              📊
            </span>

            <span>
              Analytics
            </span>

          </Link>


          <Link
            to="/goals"
            className="nav-link"
          >

            <span className="nav-icon">
              🎯
            </span>

            <span>
              Goals
            </span>

          </Link>


          <Link
            to="/ai"
            className="nav-link"
          >

            <span className="nav-icon">
              ✨
            </span>

            <span>
              AI Advisor
            </span>

          </Link>


          <Link
            to="/profile"
            className="nav-link"
          >

            <span className="nav-icon">
              👤
            </span>

            <span>
              Profile
            </span>

          </Link>

        </nav>


        {/* SIDEBAR TIP */}

        <div className="sidebar-tip">

          <div className="tip-icon">
            💡
          </div>

          <p>

            <strong>
              Money Tip
            </strong>

            <br />

            Small savings today can become
            big goals tomorrow.

          </p>

        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="finwise-main">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="finwise-topbar">

          <div>

            <span className="top-label">
              FINANCIAL OVERVIEW
            </span>

            <h1>
              Good afternoon,{" "}
              {userName} 👋
            </h1>

          </div>


          <div className="user-avatar">

            {userName
              .charAt(0)
              .toUpperCase()}

          </div>

        </header>


        {/* =================================================
            MAIN ML CARD
        ================================================= */}

        <section
          className={`financial-stress-card ${getStressClass()}`}
        >

          <div className="stress-content">

            <div className="stress-label">
              ✦ FINWISE AI
            </div>

            <h2>
              Financial Stress Level
            </h2>

            <p className="stress-description">
              Our machine learning model analyzes
              your financial information to estimate
              your current financial stress level.
            </p>


            <div className="stress-status">

              <div className="stress-icon">

                {loadingStress
                  ? "..."
                  : getStressIcon()}

              </div>


              <div>

                <span>
                  AI PREDICTION
                </span>

                <strong>
                  {loadingStress
                    ? "Analyzing..."
                    : stressLevel}
                </strong>

              </div>

            </div>


            <p className="stress-message">
              {getStressMessage()}
            </p>

          </div>


          {/* ML RESULT */}

          <div className="stress-result">

            <div className="stress-circle">

              <div className="stress-circle-inner">

                <span className="stress-circle-icon">
                  {loadingStress
                    ? "..."
                    : getStressIcon()}
                </span>

                <strong>
                  {loadingStress
                    ? "..."
                    : stressLevel}
                </strong>

                <small>
                  ML RESULT
                </small>

              </div>

            </div>


            <span className="model-label">
              RANDOM FOREST MODEL
            </span>

          </div>

        </section>


        {/* =================================================
            FINANCIAL STATISTICS
        ================================================= */}

        <section className="financial-stats">


          {/* INCOME */}

          <div className="stat-card">

            <div className="stat-icon income">
              ↗
            </div>

            <span>
              MONTHLY INCOME
            </span>

            <h3>
              {formatMoney(
                financialData.income
              )}
            </h3>

            <p>
              Total money coming in
            </p>

          </div>


          {/* EXPENSES */}

          <div className="stat-card">

            <div className="stat-icon expense">
              ↘
            </div>

            <span>
              MONTHLY EXPENSES
            </span>

            <h3>
              {formatMoney(
                financialData.expenses
              )}
            </h3>

            <p>
              Total money spent
            </p>

          </div>


          {/* SAVINGS */}

          <div className="stat-card">

            <div className="stat-icon savings">
              ◈
            </div>

            <span>
              AVAILABLE SAVINGS
            </span>

            <h3>
              {formatMoney(
                financialData.savings
              )}
            </h3>

            <p>
              Remaining after expenses
            </p>

          </div>


          {/* SAVINGS RATE */}

          <div className="stat-card">

            <div className="stat-icon rate">
              %
            </div>

            <span>
              SAVINGS RATE
            </span>

            <h3>
              {Math.max(
                financialData.savingsRate,
                0
              ).toFixed(1)}
              %
            </h3>

            <p>
              Monthly savings percentage
            </p>

          </div>

        </section>


        {/* =================================================
            LOWER GRID
        ================================================= */}

        <section className="dashboard-grid">


          {/* SAVINGS PROGRESS */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <span>
                  SAVINGS PROGRESS
                </span>

                <h3>
                  Monthly savings
                </h3>

              </div>


              <strong>
                {Math.max(
                  financialData.savingsRate,
                  0
                ).toFixed(1)}
                %
              </strong>

            </div>


            <div className="saving-number">

              {formatMoney(
                financialData.savings
              )}

            </div>


            <div className="progress-track">

              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    Math.max(
                      financialData.savingsRate,
                      0
                    ),
                    100
                  )}%`,
                }}
              />

            </div>


            <p className="progress-text">

              {financialData.savingsRate >= 20
                ? "Great savings habit! 🌱"
                : financialData.savingsRate >= 10
                ? "Keep building your savings."
                : "Try reducing unnecessary expenses."}

            </p>

          </div>


          {/* AI INSIGHT */}

          <div className="dashboard-card ai-card">

            <div className="card-header">

              <div>

                <span>
                  ✦ FINWISE AI
                </span>

                <h3>
                  Financial insight
                </h3>

              </div>

              <span className="live">
                ● LIVE
              </span>

            </div>


            <p className="ai-text">

              {financialData.savings < 0
                ? "Your expenses are currently higher than your income. Review your largest expenses."
                : financialData.savingsRate >= 20
                ? "Your savings pattern is positive. Consider allocating some savings toward your goals."
                : financialData.savingsRate >= 10
                ? "You are saving money each month. Tracking your major expenses can help you save more."
                : "Your savings rate is currently low. Review your largest spending categories."}

            </p>


            <Link
              to="/ai"
              className="ai-button"
            >
              Open AI Advisor →
            </Link>

          </div>

        </section>


        {/* =================================================
            RECENT TRANSACTIONS
        ================================================= */}

        <section className="dashboard-card transactions-card">

          <div className="card-header">

            <div>

              <span>
                ACTIVITY
              </span>

              <h3>
                Recent Transactions
              </h3>

            </div>


            <Link
              to="/transactions"
              className="view-link"
            >
              View all →
            </Link>

          </div>


          {recentTransactions.length === 0 ? (

            <div className="empty-state">

              <div>
                ₹
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Add your income and expenses
                to start analyzing your finances.
              </p>

              <Link
                to="/transactions"
                className="add-button"
              >
                Add Transaction
              </Link>

            </div>

          ) : (

            <div className="transaction-list">

              {recentTransactions.map(
                (transaction, index) => {

                  const isIncome =
                    transaction.type ===
                    "income";

                  return (

                    <div
                      className="transaction-row"
                      key={
                        transaction.id ||
                        index
                      }
                    >

                      <div
                        className={`transaction-icon ${
                          isIncome
                            ? "transaction-income"
                            : "transaction-expense"
                        }`}
                      >

                        {isIncome
                          ? "↗"
                          : "↘"}

                      </div>


                      <div className="transaction-details">

                        <strong>
                          {transaction.description ||
                            transaction.category ||
                            "Transaction"}
                        </strong>

                        <span>

                          {transaction.category ||
                            "General"}

                          {" • "}

                          {transaction.date ||
                            "Today"}

                        </span>

                      </div>


                      <strong
                        className={
                          isIncome
                            ? "income-amount"
                            : "expense-amount"
                        }
                      >

                        {isIncome
                          ? "+"
                          : "-"}

                        {formatMoney(
                          transaction.amount
                        )}

                      </strong>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="dashboard-footer">

          <strong>
            FinWise AI
          </strong>

          <span>
            Intelligent financial decisions,
            made simpler.
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Dashboard;