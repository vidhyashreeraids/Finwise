import { useEffect, useState } from "react";

const STORAGE_KEY = "finwise_transactions";

const getStoredTransactions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading transactions:", error);
    return [];
  }
};

export const newTransactionId = () => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
};

const saveTransactions = (transactions) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(transactions)
  );

  window.dispatchEvent(
    new Event("finwise_transactions_updated")
  );
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState(
    () => getStoredTransactions()
  );

  useEffect(() => {
    const syncTransactions = () => {
      setTransactions(getStoredTransactions());
    };

    window.addEventListener(
      "storage",
      syncTransactions
    );

    window.addEventListener(
      "finwise_transactions_updated",
      syncTransactions
    );

    window.addEventListener(
      "focus",
      syncTransactions
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncTransactions
      );

      window.removeEventListener(
        "finwise_transactions_updated",
        syncTransactions
      );

      window.removeEventListener(
        "focus",
        syncTransactions
      );
    };
  }, []);

  const addTransaction = (transaction) => {
    setTransactions((current) => {
      const updated = [
        transaction,
        ...current,
      ];

      saveTransactions(updated);

      return updated;
    });
  };

  const deleteTransaction = (id) => {
    setTransactions((current) => {
      const updated = current.filter(
        (transaction) =>
          transaction.id !== id
      );

      saveTransactions(updated);

      return updated;
    });
  };

  return {
    transactions,
    addTransaction,
    deleteTransaction,
  };
};