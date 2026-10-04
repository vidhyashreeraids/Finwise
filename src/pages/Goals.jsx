import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Goals.css";

function Goals() {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("finwise_goals");

    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [availableSavings, setAvailableSavings] = useState(0);

  /*
   * ==========================================
   * FINWISE AVAILABLE MONTHLY SAVINGS
   * ==========================================
   *
   * Income comes from Profile.
   *
   * Expenses =
   * Transactions + Fixed Commitments
   *
   * Fixed Commitments =
   * Rent + Loan + Subscriptions
   */

  const calculateSavings = () => {
    const savedProfile =
      localStorage.getItem("finwise_profile");

    let profile = {};

    try {
      profile = savedProfile
        ? JSON.parse(savedProfile)
        : {};
    } catch {
      profile = {};
    }

    const income =
      Number(profile.monthly_income) || 0;

    const savedTransactions =
      localStorage.getItem("finwise_transactions");

    let transactions = [];

    try {
      transactions = savedTransactions
        ? JSON.parse(savedTransactions)
        : [];
    } catch {
      transactions = [];
    }

    const transactionExpenses = transactions
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

    const totalExpenses =
      transactionExpenses +
      fixedCommitments;

    const savings =
      income - totalExpenses;

    setAvailableSavings(
      Math.max(savings, 0)
    );
  };

  useEffect(() => {
    calculateSavings();

    /*
     * Update when another tab changes
     * Profile or Transactions.
     */
    window.addEventListener(
      "storage",
      calculateSavings
    );

    /*
     * Custom event allows the same tab
     * to refresh the savings amount.
     */
    window.addEventListener(
      "finwise-data-updated",
      calculateSavings
    );

    return () => {
      window.removeEventListener(
        "storage",
        calculateSavings
      );

      window.removeEventListener(
        "finwise-data-updated",
        calculateSavings
      );
    };
  }, []);

  /*
   * ==========================================
   * MONEY FORMAT
   * ==========================================
   */

  const formatMoney = (amount) => {
    return (
      "Rs. " +
      Number(amount || 0).toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 0,
        }
      )
    );
  };

  /*
   * ==========================================
   * MONTH CALCULATION
   * ==========================================
   */

  const calculateMonths = (date) => {
    if (!date) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDateValue = new Date(date);
    targetDateValue.setHours(0, 0, 0, 0);

    if (targetDateValue <= today) {
      return 1;
    }

    const months =
      (targetDateValue.getFullYear() -
        today.getFullYear()) *
        12 +
      (targetDateValue.getMonth() -
        today.getMonth());

    return Math.max(months, 1);
  };

  /*
   * ==========================================
   * ACHIEVEMENT
   * ==========================================
   */

  const getAchievement = (
    percentage,
    completed
  ) => {
    if (completed) {
      return {
        icon: "🏆",
        title: "Goal Achieved!",
        message:
          "Amazing! You successfully reached this goal.",
        className: "achievement-complete",
      };
    }

    if (percentage >= 75) {
      return {
        icon: "🚀",
        title: "Almost There!",
        message:
          "You are very close to achieving this goal.",
        className: "achievement-75",
      };
    }

    if (percentage >= 50) {
      return {
        icon: "🔥",
        title: "Halfway Hero",
        message:
          "Great progress! Keep saving consistently.",
        className: "achievement-50",
      };
    }

    if (percentage >= 25) {
      return {
        icon: "🌱",
        title: "First Step",
        message:
          "You have started building your goal.",
        className: "achievement-25",
      };
    }

    return {
      icon: "💪",
      title: "Keep Going",
      message:
        "Every small saving brings you closer.",
      className: "achievement-start",
    };
  };

  /*
   * ==========================================
   * CREATE GOAL
   * ==========================================
   */

  const createGoal = (event) => {
    event.preventDefault();

    if (
      !name.trim() ||
      !target ||
      !targetDate
    ) {
      return;
    }

    const targetValue = Number(target);
    const savedValue =
      Number(savedAmount || 0);

    const newGoal = {
      id: Date.now(),
      name: name.trim(),
      target: targetValue,
      saved: Math.min(
        savedValue,
        targetValue
      ),
      targetDate,
    };

    const updatedGoals = [
      ...goals,
      newGoal,
    ];

    setGoals(updatedGoals);

    localStorage.setItem(
      "finwise_goals",
      JSON.stringify(updatedGoals)
    );

    setName("");
    setTarget("");
    setSavedAmount("");
    setTargetDate("");
    setShowForm(false);
  };

  /*
   * ==========================================
   * DELETE GOAL
   * ==========================================
   */

  const deleteGoal = (id) => {
    const updatedGoals = goals.filter(
      (goal) => goal.id !== id
    );

    setGoals(updatedGoals);

    localStorage.setItem(
      "finwise_goals",
      JSON.stringify(updatedGoals)
    );
  };

  /*
   * ==========================================
   * SUMMARY
   * ==========================================
   */

  const totalTarget = goals.reduce(
    (sum, goal) =>
      sum + Number(goal.target || 0),
    0
  );

  const totalSaved = goals.reduce(
    (sum, goal) =>
      sum + Number(goal.saved || 0),
    0
  );

  const completedGoals = goals.filter(
    (goal) =>
      Number(goal.saved || 0) >=
      Number(goal.target || 0)
  ).length;

  /*
   * ==========================================
   * ACHIEVEMENTS COUNT
   * ==========================================
   */

  const achievementsEarned =
    completedGoals;

  return (
    <div className="goals-page">

      {/* ==================================
          SIDEBAR
      ================================== */}

      <aside className="analytics-sidebar">

        <div className="analytics-logo">

          <div className="logo-icon">
            F
          </div>

          <div>
            <h2>FinWise</h2>
            <span>
              Smart Finance
            </span>
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

          <Link to="/analytics">
            <span>◈</span>
            Analytics
          </Link>

          <Link
            to="/goals"
            className="analytics-active"
          >
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

      {/* ==================================
          MAIN
      ================================== */}

      <main className="goals-main">

        {/* HEADER */}

        <header className="goals-header">

          <div>

            <h1>
              Savings Goals
            </h1>

            <p>
              Turn your plans into
              achievable financial goals.
            </p>

          </div>

          <button
            className="add-goal-button"
            onClick={() =>
              setShowForm(true)
            }
          >
            + New Goal
          </button>

        </header>

        {/* ==================================
            SUMMARY
        ================================== */}

        <section className="goals-summary">

          <div className="goal-summary-card">

            <span>
              Total Goals
            </span>

            <strong>
              {goals.length}
            </strong>

          </div>

          <div className="goal-summary-card">

            <span>
              Total Saved
            </span>

            <strong>
              {formatMoney(totalSaved)}
            </strong>

          </div>

          <div className="goal-summary-card">

            <span>
              Total Target
            </span>

            <strong>
              {formatMoney(totalTarget)}
            </strong>

          </div>

          <div className="goal-summary-card achievement-summary">

            <span>
              🏆 Achievements
            </span>

            <strong>
              {achievementsEarned}
            </strong>

          </div>

        </section>

        {/* ==================================
            FORM
        ================================== */}

        {showForm && (

          <div className="goal-form-container">

            <div className="goal-form-header">

              <div>

                <h2>
                  Create a New Goal
                </h2>

                <p>
                  Give your money something
                  to work toward.
                </p>

              </div>

              <button
                className="close-goal"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={createGoal}
            >

              {/* GOAL NAME */}

              <div className="goal-input">

                <label>
                  Goal Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. New Laptop"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                />

              </div>

              {/* TARGET */}

              <div className="goal-input">

                <label>
                  Target Amount
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 80000"
                  value={target}
                  onChange={(event) =>
                    setTarget(
                      event.target.value
                    )
                  }
                />

              </div>

              {/* ALREADY SAVED */}

              <div className="goal-input">

                <label>
                  Already Saved
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 15000"
                  value={savedAmount}
                  onChange={(event) =>
                    setSavedAmount(
                      event.target.value
                    )
                  }
                />

              </div>

              {/* TARGET DATE */}

              <div className="goal-input">

                <label>
                  Target Date
                </label>

                <input
                  type="date"
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  value={targetDate}
                  onChange={(event) =>
                    setTargetDate(
                      event.target.value
                    )
                  }
                />

              </div>

              {/* CREATE */}

              <button
                className="create-goal-button"
                type="submit"
              >
                Create Goal
              </button>

            </form>

          </div>

        )}

        {/* ==================================
            GOALS
        ================================== */}

        {goals.length === 0 ? (

          <div className="empty-goals">

            <div className="empty-goal-icon">
              ◎
            </div>

            <h2>
              No savings goals yet
            </h2>

            <p>
              Create your first goal and
              start building toward
              something meaningful.
            </p>

            <button
              onClick={() =>
                setShowForm(true)
              }
            >
              Create Your First Goal
            </button>

          </div>

        ) : (

          <section className="goal-grid">

            {goals.map((goal) => {

              const goalTarget =
                Number(goal.target || 0);

              const goalSaved =
                Number(goal.saved || 0);

              const percentage =
                goalTarget > 0
                  ? Math.min(
                      Math.round(
                        (goalSaved /
                          goalTarget) *
                          100
                      ),
                      100
                    )
                  : 0;

              const remaining =
                Math.max(
                  goalTarget -
                    goalSaved,
                  0
                );

              const completed =
                goalSaved >=
                goalTarget;

              /*
               * MONTHS LEFT
               */

              const monthsLeft =
                calculateMonths(
                  goal.targetDate
                );

              /*
               * MONTHLY NEEDED
               */

              const monthlyNeeded =
                completed
                  ? 0
                  : monthsLeft > 0
                  ? Math.ceil(
                      remaining /
                        monthsLeft
                    )
                  : remaining;

              /*
               * FEASIBILITY
               */

              let feasibility =
                "Not enough data";

              let feasibilityClass =
                "feasibility-neutral";

              if (completed) {

                feasibility =
                  "Goal achieved";

                feasibilityClass =
                  "feasibility-success";

              } else if (
                availableSavings <= 0
              ) {

                feasibility =
                  "Needs attention";

                feasibilityClass =
                  "feasibility-danger";

              } else if (
                monthlyNeeded <=
                availableSavings
              ) {

                feasibility =
                  "On track";

                feasibilityClass =
                  "feasibility-success";

              } else {

                feasibility =
                  "Needs adjustment";

                feasibilityClass =
                  "feasibility-warning";

              }

              /*
               * ACHIEVEMENT
               */

              const achievement =
                getAchievement(
                  percentage,
                  completed
                );

              return (

                <div
                  className={`goal-card ${
                    completed
                      ? "goal-completed"
                      : ""
                  }`}
                  key={goal.id}
                >

                  {/* TOP */}

                  <div className="goal-card-top">

                    <div
                      className={`goal-icon ${
                        completed
                          ? "completed-icon"
                          : ""
                      }`}
                    >
                      {completed
                        ? "✓"
                        : "◎"}
                    </div>

                    <button
                      className="delete-goal"
                      onClick={() =>
                        deleteGoal(
                          goal.id
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                  {/* NAME */}

                  <h2>
                    {goal.name}
                  </h2>

                  {/* MONEY */}

                  <div className="goal-money">

                    <strong>
                      {formatMoney(
                        goalSaved
                      )}
                    </strong>

                    <span>
                      of{" "}
                      {formatMoney(
                        goalTarget
                      )}
                    </span>

                  </div>

                  {/* PROGRESS */}

                  <div className="goal-progress">

                    <div
                      style={{
                        width:
                          `${percentage}%`,
                      }}
                    />

                  </div>

                  <div className="goal-progress-info">

                    <span>
                      {percentage}%
                      complete
                    </span>

                    <span>
                      {completed
                        ? "Goal achieved 🎉"
                        : `${formatMoney(
                            remaining
                          )} remaining`}
                    </span>

                  </div>

                  {/* TARGET DATE */}

                  {goal.targetDate && (

                    <div className="goal-detail">

                      <span>
                        Target Date
                      </span>

                      <strong>
                        {new Date(
                          goal.targetDate
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </strong>

                    </div>

                  )}

                  {/* MONTHLY NEEDED */}

                  {!completed && (

                    <div className="goal-detail">

                      <span>
                        Monthly Needed
                      </span>

                      <strong>
                        {formatMoney(
                          monthlyNeeded
                        )}
                      </strong>

                    </div>

                  )}

                  {/* FEASIBILITY */}

                  <div
                    className={`goal-feasibility ${feasibilityClass}`}
                  >

                    <span>
                      Feasibility
                    </span>

                    <strong>
                      {feasibility}
                    </strong>

                  </div>

                  {/* AVAILABLE SAVINGS */}

                  {!completed && (

                    <p className="goal-savings-info">

                      FinWise available
                      monthly savings:{" "}

                      <strong>
                        {formatMoney(
                          availableSavings
                        )}
                      </strong>

                    </p>

                  )}

                  {/* ==================================
                      ACHIEVEMENT
                  ================================== */}

                  <div
                    className={`goal-achievement ${achievement.className}`}
                  >

                    <div className="achievement-icon">
                      {achievement.icon}
                    </div>

                    <div>

                      <strong>
                        {achievement.title}
                      </strong>

                      <p>
                        {achievement.message}
                      </p>

                    </div>

                  </div>

                </div>

              );
            })}

          </section>

        )}

      </main>

    </div>
  );
}

export default Goals;