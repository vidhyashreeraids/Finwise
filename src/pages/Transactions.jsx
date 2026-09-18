import { useEffect, useState } from "react";

const defaultTransactions = [
  {
    id: 1,
    type: "expense",
    category: "Food",
    description: "Restaurant",
    amount: 850,
    date: "2026-08-10",
  },
  {
    id: 2,
    type: "expense",
    category: "Travel",
    description: "Uber",
    amount: 320,
    date: "2026-08-10",
  },
  {
    id: 3,
    type: "income",
    category: "Salary",
    description: "Freelance Payment",
    amount: 5000,
    date: "2026-08-09",
  },
];

function Transactions() {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem(
      "finwise_transactions"
    );

    return savedTransactions
      ? JSON.parse(savedTransactions)
      : defaultTransactions;
  });

  const [showForm, setShowForm] = useState(false);

  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "finwise_transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  const addTransaction = (e) => {
    e.preventDefault();

    if (!description.trim() || !amount || Number(amount) <= 0) {
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type,
      category,
      description: description.trim(),
      amount: Number(amount),
      date: new Date().toISOString().split("T")[0],
    };

    setTransactions((currentTransactions) => [
      newTransaction,
      ...currentTransactions,
    ]);

    setDescription("");
    setAmount("");
    setCategory("Food");
    setType("expense");
    setShowForm(false);
  };

  const deleteTransaction = (id) => {
    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (transaction) => transaction.id !== id
      )
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="transactions-page">

      <div className="page-header">

        <div>
          <h1>Transactions</h1>

          <p>
            Track your income and expenses
          </p>
        </div>

        <button
          className="add-transaction-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Transaction
        </button>

      </div>

      {showForm && (
        <div className="transaction-form-card">

          <h2>Add Transaction</h2>

          <form onSubmit={addTransaction}>

            <div className="transaction-type">

              <button
                type="button"
                className={
                  type === "expense"
                    ? "type-btn selected"
                    : "type-btn"
                }
                onClick={() => setType("expense")}
              >
                Expense
              </button>

              <button
                type="button"
                className={
                  type === "income"
                    ? "type-btn selected"
                    : "type-btn"
                }
                onClick={() => setType("income")}
              >
                Income
              </button>

            </div>

            <div className="form-row">

              <div className="form-field">

                <label>Description</label>

                <input
                  type="text"
                  placeholder="e.g. Grocery shopping"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />

              </div>

              <div className="form-field">

                <label>Amount</label>

                <input
                  type="number"
                  min="1"
                  placeholder="₹ 0"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                />

              </div>

            </div>

            <div className="form-field">

              <label>Category</label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                <option>Food</option>
                <option>Shopping</option>
                <option>Travel</option>
                <option>Bills</option>
                <option>Education</option>
                <option>Entertainment</option>
                <option>Health</option>
                <option>Salary</option>
                <option>Freelance</option>
                <option>Other</option>
              </select>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
              >
                Add Transaction
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="transactions-card-page">

        <div className="transaction-page-header">

          <div>
            <h2>All Transactions</h2>

            <p>
              {transactions.length} transactions
            </p>
          </div>

        </div>

        <div className="full-transaction-list">

          {transactions.length === 0 ? (
            <div className="empty-transactions">
              <div>💰</div>

              <h3>No transactions yet</h3>

              <p>
                Add your first income or expense
                to get started.
              </p>
            </div>
          ) : (
            transactions.map((transaction) => (

              <div
                className="full-transaction"
                key={transaction.id}
              >

                <div className="transaction-icon">

                  {transaction.type === "income"
                    ? "💼"
                    : "💳"}

                </div>

                <div className="transaction-details">

                  <strong>
                    {transaction.description}
                  </strong>

                  <span>
                    {transaction.category} •{" "}
                    {formatDate(transaction.date)}
                  </span>

                </div>

                <strong
                  className={
                    transaction.type === "income"
                      ? "transaction-income"
                      : "transaction-expense"
                  }
                >
                  {transaction.type === "income"
                    ? "+"
                    : "-"}
                  ₹{transaction.amount.toLocaleString("en-IN")}
                </strong>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteTransaction(transaction.id)
                  }
                  title="Delete transaction"
                >
                  🗑️
                </button>

              </div>

            ))
          )}

        </div>

      </div>

    </div>
  );
}

export default Transactions;