import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useTransactions,
  newTransactionId,
} from "../utils/transactionStore";

function Transactions() {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
  } = useTransactions();

  const [profile, setProfile] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other",
  ];

  useEffect(() => {
    const loadProfile = () => {
      try {
        const savedProfile =
          localStorage.getItem("finwise_profile");

        if (!savedProfile) {
          setProfile({});
          return;
        }

        const parsedProfile =
          JSON.parse(savedProfile);

        setProfile(
          parsedProfile &&
            typeof parsedProfile === "object"
            ? parsedProfile
            : {}
        );
      } catch (error) {
        console.error(
          "Transactions profile error:",
          error
        );

        setProfile({});
      }
    };

    loadProfile();

    window.addEventListener(
      "storage",
      loadProfile
    );

    window.addEventListener(
      "finwise_transactions_updated",
      loadProfile
    );

    window.addEventListener(
      "focus",
      loadProfile
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadProfile
      );

      window.removeEventListener(
        "finwise_transactions_updated",
        loadProfile
      );

      window.removeEventListener(
        "focus",
        loadProfile
      );
    };
  }, []);

  const handleAddTransaction = (e) => {
    e.preventDefault();

    if (
      !description.trim() ||
      !amount ||
      Number(amount) <= 0
    ) {
      alert("Please enter a valid description and amount.");
      return;
    }

    const transaction = {
      id: newTransactionId(),
      type,
      category:
        type === "income" ? "Income" : category,
      description: description.trim(),
      amount: Number(amount),
      date: new Date().toISOString().split("T")[0],
    };

    addTransaction(transaction);

    setDescription("");
    setAmount("");
    setCategory("Food");
    setType("expense");
    setShowForm(false);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (confirmDelete) {
      deleteTransaction(id);
    }
  };

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // DEFAULT MONTHLY INCOME
  const defaultIncome =
    Number(profile.monthly_income) || 0;

  // INCOME TRANSACTIONS
  const transactionIncome = transactions
    .filter((t) => t.type === "income")
    .reduce(
      (total, t) =>
        total + Number(t.amount || 0),
      0
    );

  // DEFAULT INCOME + TRANSACTION INCOME
  const totalIncome =
    defaultIncome + transactionIncome;

  // EXPENSE TRANSACTIONS
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (total, t) =>
        total + Number(t.amount || 0),
      0
    );

  // TOTAL BALANCE
  const balance =
    totalIncome - totalExpenses;

  const filteredTransactions =
    transactions.filter(
      (transaction) => {
        const matchesSearch =
          transaction.description
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          transaction.category
            ?.toLowerCase()
            .includes(search.toLowerCase());

        const matchesFilter =
          filter === "all" ||
          transaction.type === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

  return (
    <div className="finwise-layout">

      {/* SIDEBAR */}
      <aside className="finwise-sidebar">
        <div className="finwise-logo">
          <h2>FinWise</h2>
          <span>AI Financial Coach</span>
        </div>

        <nav className="finwise-nav">

          <Link to="/dashboard">
            ⌂ Dashboard
          </Link>

          <Link
            to="/transactions"
            className="nav-active"
          >
            ↔ Transactions
          </Link>

          <Link to="/analytics">
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

            <span>💡</span>

            <p>
              Track your spending to make
              smarter financial decisions.
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
              FINANCIAL MANAGEMENT
            </p>

            <h1>
              Transactions
            </h1>

            <p className="page-description">
              Keep track of your income and spending.
            </p>

          </div>

          <button
            className="royal-button"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            {showForm
              ? "✕ Close"
              : "+ Add Transaction"}
          </button>

        </header>

        {/* SUMMARY CARDS */}
        <section className="transaction-summary">

          <div className="money-card">

            <div className="money-icon income-icon">
              ↗
            </div>

            <div>

              <p>
                Total Income
              </p>

              <h2>
                {formatMoney(totalIncome)}
              </h2>

            </div>

          </div>

          <div className="money-card">

            <div className="money-icon expense-icon">
              ↘
            </div>

            <div>

              <p>
                Total Expenses
              </p>

              <h2>
                {formatMoney(totalExpenses)}
              </h2>

            </div>

          </div>

          <div className="money-card">

            <div className="money-icon balance-icon">
              ₹
            </div>

            <div>

              <p>
                Balance
              </p>

              <h2
                className={
                  balance >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {formatMoney(balance)}
              </h2>

            </div>

          </div>

          <div className="money-card">

            <div className="money-icon count-icon">
              #
            </div>

            <div>

              <p>
                Transactions
              </p>

              <h2>
                {transactions.length}
              </h2>

            </div>

          </div>

        </section>

        {/* ADD FORM */}
        {showForm && (

          <form
            className="transaction-form"
            onSubmit={handleAddTransaction}
          >

            <div className="form-title">

              <div>

                <p className="page-label">
                  NEW ENTRY
                </p>

                <h2>
                  Add Transaction
                </h2>

              </div>

            </div>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Transaction Type
                </label>

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value)
                  }
                >

                  <option value="expense">
                    Expense
                  </option>

                  <option value="income">
                    Income
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  disabled={type === "income"}
                >

                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="form-group">

                <label>
                  Description
                </label>

                <input
                  type="text"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Eg: Grocery shopping"
                />

              </div>

              <div className="form-group">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="₹ Amount"
                />

              </div>

            </div>

            <button
              type="submit"
              className="save-button"
            >
              Save Transaction
            </button>

          </form>

        )}

        {/* TRANSACTION SECTION */}
        <section className="transactions-container">

          <div className="transactions-top">

            <div>

              <p className="page-label">
                ACTIVITY
              </p>

              <h2>
                Transaction History
              </h2>

            </div>

            <div className="transaction-controls">

              <input
                type="text"
                placeholder="🔍 Search..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
              >

                <option value="all">
                  All
                </option>

                <option value="income">
                  Income
                </option>

                <option value="expense">
                  Expenses
                </option>

              </select>

            </div>

          </div>

          {filteredTransactions.length === 0 ? (

            <div className="empty-transactions">

              <div className="empty-icon">
                ₹
              </div>

              <h3>
                No transactions found
              </h3>

              <p>
                Add a transaction to start
                tracking your finances.
              </p>

            </div>

          ) : (

            <div className="transaction-list">

              {filteredTransactions.map(
                (transaction) => (

                  <div
                    className="transaction-item"
                    key={transaction.id}
                  >

                    <div className="transaction-left">

                      <div
                        className={`transaction-category ${
                          transaction.type ===
                          "income"
                            ? "category-income"
                            : "category-expense"
                        }`}
                      >

                        {transaction.type ===
                        "income"
                          ? "↗"
                          : "↘"}

                      </div>

                      <div>

                        <h3>
                          {transaction.description}
                        </h3>

                        <p>

                          {transaction.category}

                          <span>
                            {" • "}
                          </span>

                          {formatDate(
                            transaction.date
                          )}

                        </p>

                      </div>

                    </div>

                    <div className="transaction-right">

                      <strong
                        className={
                          transaction.type ===
                          "income"
                            ? "positive"
                            : "negative"
                        }
                      >

                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}

                        {formatMoney(
                          transaction.amount
                        )}

                      </strong>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            transaction.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Transactions;