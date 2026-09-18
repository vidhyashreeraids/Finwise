import { useState } from "react";

const suggestions = [
  "How can I save more money?",
  "Am I spending too much?",
  "How should I build an emergency fund?",
  "Give me a simple monthly budget.",
];

function AIAdvisor() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      sender: "ai",
      text: "Hi! I'm your FinWise AI Advisor. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  // =====================================================
  // GET SAVED PROFILE + TRANSACTION DATA
  // =====================================================

  const getFinancialContext = () => {
    const profile = JSON.parse(
      localStorage.getItem("finwise_profile") || "{}"
    );

    const transactions = JSON.parse(
      localStorage.getItem("finwise_transactions") || "[]"
    );

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const monthlyIncome = income;
    const savings = income - expenses;

    const savingsRate =
      income > 0
        ? ((savings / income) * 100).toFixed(1)
        : "0.0";

    const transactionDetails = transactions
      .map(
        (t) =>
          `${t.date} | ${t.type} | ${t.category} | ₹${t.amount} | ${
            t.description || ""
          }`
      )
      .join("\n");

    return `
FINANCIAL INFORMATION

PROFILE

Income from Transactions: ₹${income}
Profile Monthly Income: ₹${profile.monthly_income || 0}
Budget Goal: ₹${profile.budget_goal || 0}
Credit Score: ${profile.credit_score || "Not provided"}
Debt-to-Income Ratio: ${
      profile.debt_to_income_ratio || "Not provided"
    }%
Loan Payment: ₹${profile.loan_payment || 0}
Investment Amount: ₹${
      profile.investment_amount || 0
    }
Subscriptions: ₹${
      profile.subscription_services || 0
    }
Emergency Fund: ₹${
      profile.emergency_fund || 0
    }
Rent / Mortgage: ₹${
      profile.rent_or_mortgage || 0
    }
Income Type: ${profile.income_type || "Not provided"}

CURRENT FINANCIAL ACTIVITY

Transaction Income: ₹${income}
Total Expenses: ₹${expenses}
Current Savings: ₹${savings}
Number of Transactions: ${transactions.length}

TRANSACTIONS

${transactionDetails || "No transactions available."}
`;
  };

  // =====================================================
  // API
  // DO NOT CHANGE
  // =====================================================

  const fetchAIResponse = async (userMessage) => {
    try {
      const financialContext = getFinancialContext();

      const userPrompt = `
You are FinWise AI, a personal financial assistant.

The user's saved financial information is given below:

${financialContext}

USER QUESTION:
${userMessage}

Instructions:
- Use the user's saved financial information.
- Do not ask the user to repeat information already available.
- Use actual numbers from the report.
- Give simple and practical answers.
- Show calculations when useful.
- Do not invent financial information.
`;

      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userPrompt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return (
          data.error ||
          data.details ||
          "Something went wrong with the AI server."
        );
      }

      return (
        data.reply ||
        "I couldn't generate a response."
      );
    } catch (error) {
      console.error("AI backend error:", error);

      return "Unable to connect to the AI server. Please make sure your backend is running.";
    }
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = async (text) => {
    const message = text.trim();

    if (!message || typing) {
      return;
    }

    setMessages((oldMessages) => [
      ...oldMessages,
      {
        id: crypto.randomUUID(),
        sender: "user",
        text: message,
      },
    ]);

    setInput("");
    setTyping(true);

    const reply = await fetchAIResponse(message);

    setMessages((oldMessages) => [
      ...oldMessages,
      {
        id: crypto.randomUUID(),
        sender: "ai",
        text: reply,
      },
    ]);

    setTyping(false);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  // =====================================================
  // CLEAR CHAT
  // =====================================================

  const clearChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: "ai",
        text: "Hi! I'm your FinWise AI Advisor. How can I help you today?",
      },
    ]);

    setInput("");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <style>{`

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  .ai-page {
    width: 100%;
    min-height: 100vh;
    padding: 20px 24px;

    background:
      radial-gradient(
        circle at 5% 5%,
        #e2efe0 0%,
        transparent 25%
      ),
      radial-gradient(
        circle at 95% 5%,
        #f3ead6 0%,
        transparent 28%
      ),
      #f8f5eb;

    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;

    color: #294333;
  }

  .ai-wrapper {
    width: 100%;
    max-width: 1550px;
    margin: 0 auto;
  }

  /* ================================
     HEADER
  ================================ */

  .ai-header {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 17px 22px;
    margin-bottom: 16px;

    background: #fffdf6;

    border: 1px solid #e3dccb;
    border-radius: 20px;

    box-shadow:
      0 8px 28px
      rgba(35, 70, 46, 0.07);
  }

  .ai-brand {
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .ai-logo {
    width: 46px;
    height: 46px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 13px;

    background:
      linear-gradient(
        135deg,
        #123f29,
        #2f7549
      );

    color: #fffdf4;

    font-size: 22px;
  }

  .ai-brand h1 {
    margin: 0;

    color: #123f29;

    font-size: 23px;
    font-weight: 750;
  }

  .ai-brand p {
    margin: 3px 0 0;

    color: #949988;

    font-size: 11px;
  }

  .ai-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .online {
    display: flex;
    align-items: center;
    gap: 7px;

    padding: 7px 12px;

    border-radius: 20px;

    background: #e6f0e2;

    color: #28623e;

    font-size: 10px;
    font-weight: 650;
  }

  .online-dot {
    width: 7px;
    height: 7px;

    border-radius: 50%;

    background: #3c8753;
  }

  .clear-btn {
    border: none;

    padding: 8px 13px;

    border-radius: 10px;

    background: #ebe6d9;

    color: #687264;

    cursor: pointer;

    font-size: 10px;
  }

  /* ================================
     MAIN OUTER BOX
  ================================ */

  .advisor-container {
    width: 100%;

    height: calc(100vh - 120px);

    min-height: 600px;

    display: grid;

    grid-template-columns:
      minmax(0, 1fr) 300px;

    overflow: hidden;

    background: #fffdf6;

    border: 1px solid #e3dccb;

    border-radius: 24px;

    box-shadow:
      0 15px 45px
      rgba(35, 70, 46, 0.09);
  }

  /* ================================
     CHAT SECTION
  ================================ */

  .chat-section {
    min-width: 0;
    min-height: 0;

    height: 100%;

    display: flex;
    flex-direction: column;

    overflow: hidden;

    border-right:
      1px solid #e8e2d5;
  }

  .chat-top {
    flex-shrink: 0;

    min-height: 74px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 17px 25px;

    border-bottom:
      1px solid #ebe5d8;

    background: #fffdf6;
  }

  .chat-top h2 {
    margin: 0;

    color: #174d32;

    font-size: 17px;
  }

  .chat-top p {
    margin: 4px 0 0;

    color: #999d8f;

    font-size: 10px;
  }

  .private {
    padding: 7px 11px;

    border-radius: 18px;

    background: #e8f1e5;

    color: #28623e;

    font-size: 9px;
    font-weight: 650;
  }

  /* ================================
     IMPORTANT:
     MESSAGE AREA CAN SCROLL
  ================================ */

  .messages {
    flex: 1;

    min-height: 0;

    overflow-y: auto;
    overflow-x: hidden;

    padding: 28px 32px;

    display: flex;
    flex-direction: column;

    gap: 20px;

    background:
      linear-gradient(
        180deg,
        #faf8f0,
        #fffdf6
      );
  }

  .messages::-webkit-scrollbar {
    width: 7px;
  }

  .messages::-webkit-scrollbar-track {
    background: #f4f1e8;
  }

  .messages::-webkit-scrollbar-thumb {
    background: #b8c8b8;

    border-radius: 10px;
  }

  .messages::-webkit-scrollbar-thumb:hover {
    background: #8fa993;
  }

  /* ================================
     MESSAGE
  ================================ */

  .message {
    display: flex;
    align-items: flex-start;

    gap: 10px;

    width: 100%;
    max-width: 92%;

    min-width: 0;
  }

  .message.user {
    align-self: flex-end;

    flex-direction: row-reverse;
  }

  .message-content {
    min-width: 0;

    max-width: calc(100% - 47px);

    display: flex;
    flex-direction: column;

    gap: 5px;
  }

  .user .message-content {
    align-items: flex-end;
  }

  /* ================================
     AVATAR
  ================================ */

  .avatar {
    width: 37px;
    height: 37px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 12px;

    font-size: 12px;
    font-weight: 700;
  }

  .ai-avatar {
    background:
      linear-gradient(
        135deg,
        #123f29,
        #2f7549
      );

    color: #fffdf4;
  }

  .user-avatar {
    background: #e7e3d7;

    color: #697366;

    font-size: 8px;
  }

  /* ================================
     MESSAGE TEXT
  ================================ */

  .message-name {
    padding: 0 5px;

    color: #999d8f;

    font-size: 9px;
    font-weight: 650;
  }

  .bubble {
    width: fit-content;

    max-width: 100%;

    padding: 14px 18px;

    border-radius:
      5px 17px 17px 17px;

    background: #fffdf7;

    border:
      1px solid #e8e1d4;

    color: #526255;

    font-size: 12px;

    line-height: 1.7;

    box-shadow:
      0 4px 15px
      rgba(35, 70, 46, 0.04);

    /*
      IMPORTANT:
      Long Gemini answers will wrap
      instead of going outside the box.
    */

    white-space: pre-wrap;

    overflow-wrap: anywhere;

    word-break: normal;
  }

  .user .bubble {
    border-radius:
      17px 5px 17px 17px;

    background:
      linear-gradient(
        135deg,
        #dcebdc,
        #e9eddb
      );

    border:
      1px solid #d2e1d0;

    color: #35563f;
  }

  /* ================================
     TYPING
  ================================ */

  .typing {
    display: flex;

    gap: 5px;

    padding: 14px 18px;
  }

  .typing span {
    width: 6px;
    height: 6px;

    border-radius: 50%;

    background: #4d7959;

    animation:
      bounce 1.2s infinite;
  }

  .typing span:nth-child(2) {
    animation-delay: 0.15s;
  }

  .typing span:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes bounce {

    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.4;
    }

    30% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }

  /* ================================
     QUICK QUESTIONS
  ================================ */

  .quick {
    flex-shrink: 0;

    padding: 15px 25px;

    border-top:
      1px solid #ebe5d8;

    background: #fffdf6;
  }

  .quick-heading {
    display: flex;
    align-items: center;

    gap: 7px;

    margin-bottom: 9px;
  }

  .quick-heading strong {
    color: #465647;

    font-size: 10px;
  }

  .quick-heading span {
    color: #aaa99a;

    font-size: 9px;
  }

  .suggestions {
    display: grid;

    grid-template-columns:
      repeat(2, 1fr);

    gap: 8px;
  }

  .suggestion {
    min-height: 36px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 9px 12px;

    border:
      1px solid #e4ded0;

    border-radius: 10px;

    background: #fbf9f2;

    color: #687467;

    font-size: 10px;

    text-align: left;

    cursor: pointer;

    transition: 0.2s;
  }

  .suggestion:hover {
    background: #edf4e9;

    border-color: #cadbc8;

    color: #28613e;
  }

  .suggestion:disabled {
    opacity: 0.55;

    cursor: not-allowed;
  }

  .suggestion span {
    color: #4d7b59;

    font-size: 14px;
  }

  /* ================================
     INPUT
  ================================ */

  .input-area {
    flex-shrink: 0;

    display: flex;
    align-items: center;

    margin:
      0 25px 19px;

    padding: 5px;

    border:
      1px solid #ddd8ca;

    border-radius: 15px;

    background: #fffdf7;

    box-shadow:
      0 5px 18px
      rgba(35, 70, 46, 0.05);
  }

  .input-area:focus-within {
    border-color: #66886b;
  }

  .input-area input {
    flex: 1;

    min-width: 0;

    border: none;
    outline: none;

    background: transparent;

    padding: 11px 13px;

    color: #425446;

    font-size: 11px;
  }

  .input-area input::placeholder {
    color: #aaa99a;
  }

  .send-btn {
    width: 39px;
    height: 39px;

    flex-shrink: 0;

    border: none;

    border-radius: 11px;

    background:
      linear-gradient(
        135deg,
        #123f29,
        #2d7548
      );

    color: #fffdf4;

    font-size: 18px;

    cursor: pointer;
  }

  .send-btn:disabled {
    opacity: 0.4;

    cursor: not-allowed;
  }

  /* ================================
     SIDEBAR
  ================================ */

  .advisor-sidebar {
    min-width: 0;
    min-height: 0;

    height: 100%;

    padding: 20px 17px;

    overflow-y: auto;

    background:
      linear-gradient(
        180deg,
        #fffdf6,
        #faf8ef
      );
  }

  .advisor-sidebar::-webkit-scrollbar {
    width: 5px;
  }

  .advisor-sidebar::-webkit-scrollbar-thumb {
    background: #cbd5c7;

    border-radius: 10px;
  }

  .side-card {
    padding: 17px;

    margin-bottom: 13px;

    border-radius: 17px;

    background: #fffdf7;

    border:
      1px solid #e5dfd1;

    box-shadow:
      0 6px 18px
      rgba(35, 70, 46, 0.045);
  }

  .highlight {
    background:
      radial-gradient(
        circle at 100% 0%,
        #dcebd9 0%,
        transparent 58%
      ),
      #fffdf6;
  }

  .big-icon {
    width: 41px;
    height: 41px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 10px;

    border-radius: 12px;

    background: #123f29;

    color: #fffdf4;

    font-size: 18px;
  }

  .side-card h3 {
    margin: 0 0 6px;

    color: #174d32;

    font-size: 13px;
  }

  .side-card p {
    margin: 0;

    color: #899181;

    font-size: 9px;

    line-height: 1.55;
  }

  .help-list {
    display: flex;
    flex-direction: column;

    gap: 2px;

    margin-top: 8px;
  }

  .help {
    display: flex;
    align-items: center;

    gap: 8px;

    padding: 7px 4px;

    border-radius: 9px;
  }

  .help:hover {
    background: #f0f4eb;
  }

  .help-icon {
    width: 29px;
    height: 29px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 8px;

    background: #edf2e9;

    font-size: 13px;
  }

  .help-text {
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 2px;
  }

  .help-text strong {
    color: #536154;

    font-size: 9px;
  }

  .help-text small {
    color: #9da295;

    font-size: 7px;
  }

  .tip {
    display: flex;

    gap: 9px;

    padding: 13px;

    margin-bottom: 13px;

    border-radius: 15px;

    background:
      linear-gradient(
        135deg,
        #f3efd9,
        #f7f1e4
      );

    border:
      1px solid #e6ddc5;
  }

  .tip-icon {
    width: 29px;
    height: 29px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 8px;

    background: #fffdf5;

    font-size: 13px;
  }

  .tip strong {
    color: #706746;

    font-size: 9px;
  }

  .tip p {
    margin-top: 3px;

    color: #91886b;

    font-size: 8px;
  }

  .disclaimer {
    padding: 12px 13px;

    border-radius: 13px;

    background: #f0eee7;

    border:
      1px solid #e3dfd4;
  }

  .disclaimer strong {
    color: #6e756a;

    font-size: 8px;
  }

  .disclaimer p {
    margin-top: 3px;

    color: #989d93;

    font-size: 7px;

    line-height: 1.5;
  }

  /* ================================
     TABLET
  ================================ */

  @media (max-width: 950px) {

    .advisor-container {
      height: auto;

      grid-template-columns: 1fr;
    }

    .chat-section {
      height: 700px;

      border-right: none;

      border-bottom:
        1px solid #e8e2d5;
    }

    .advisor-sidebar {
      height: auto;

      display: grid;

      grid-template-columns:
        repeat(2, 1fr);

      gap: 12px;
    }

    .side-card,
    .tip,
    .disclaimer {
      margin-bottom: 0;
    }
  }

  /* ================================
     MOBILE
  ================================ */

  @media (max-width: 650px) {

    .ai-page {
      padding: 10px;
    }

    .ai-header {
      padding: 14px;
    }

    .ai-brand h1 {
      font-size: 19px;
    }

    .ai-brand p {
      font-size: 9px;
    }

    .ai-logo {
      width: 40px;
      height: 40px;
    }

    .online {
      display: none;
    }

    .advisor-container {
      border-radius: 18px;
    }

    .chat-section {
      height: 650px;
    }

    .chat-top {
      padding: 15px;
    }

    .private {
      display: none;
    }

    .messages {
      padding: 18px 14px;
    }

    .message {
      max-width: 96%;
    }

    .message-content {
      max-width:
        calc(100% - 45px);
    }

    .bubble {
      font-size: 11px;

      padding: 12px 14px;

      line-height: 1.65;
    }

    .quick {
      padding: 13px;
    }

    .suggestions {
      grid-template-columns: 1fr;
    }

    .input-area {
      margin:
        0 13px 14px;
    }

    .advisor-sidebar {
      display: flex;

      flex-direction: column;

      padding: 14px;
    }

  }

`}</style>

      {/* =================================================
          PAGE
      ================================================= */}

      <div className="ai-page">

        <div className="ai-wrapper">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="ai-header">

            <div className="ai-brand">

              <div className="ai-logo">
                ✦
              </div>

              <div>

                <h1>
                  AI Advisor
                </h1>

                <p>
                  Your personal financial assistant
                </p>

              </div>

            </div>

            <div className="ai-actions">

              <div className="online">

                <span className="online-dot"></span>

                Online

              </div>

              <button
                className="clear-btn"
                onClick={clearChat}
              >
                Clear chat
              </button>

            </div>

          </header>

          {/* =================================================
              ONE BIG OUTER CONTAINER
          ================================================= */}

          <div className="advisor-container">

            {/* =================================================
                LEFT — CHAT
            ================================================= */}

            <section className="chat-section">

              <div className="chat-top">

                <div>

                  <h2>
                    Financial Assistant
                  </h2>

                  <p>
                    Ask questions about your personal finances.
                  </p>

                </div>

                <span className="private">
                  🔒 Private
                </span>

              </div>

              {/* =================================================
                  MESSAGES
              ================================================= */}

              <div className="messages">

                {messages.map((message) => (

                  <div
                    key={message.id}
                    className={`message ${
                      message.sender === "user"
                        ? "user"
                        : "ai"
                    }`}
                  >

                    {message.sender === "ai" && (

                      <div className="avatar ai-avatar">
                        ✦
                      </div>

                    )}

                    <div className="message-content">

                      <span className="message-name">

                        {message.sender === "ai"
                          ? "FinWise AI"
                          : "You"}

                      </span>

                      <div className="bubble">
                        {message.text}
                      </div>

                    </div>

                    {message.sender === "user" && (

                      <div className="avatar user-avatar">
                        You
                      </div>

                    )}

                  </div>

                ))}

                {/* =================================================
                    TYPING
                ================================================= */}

                {typing && (

                  <div className="message ai">

                    <div className="avatar ai-avatar">
                      ✦
                    </div>

                    <div className="message-content">

                      <span className="message-name">
                        FinWise AI
                      </span>

                      <div className="bubble typing">

                        <span></span>
                        <span></span>
                        <span></span>

                      </div>

                    </div>

                  </div>

                )}

              </div>

              {/* =================================================
                  QUICK QUESTIONS
              ================================================= */}

              <div className="quick">

                <div className="quick-heading">

                  <strong>
                    Quick questions
                  </strong>

                  <span>
                    Try asking one
                  </span>

                </div>

                <div className="suggestions">

                  {suggestions.map(
                    (suggestion) => (

                      <button
                        key={suggestion}
                        className="suggestion"
                        disabled={typing}
                        onClick={() =>
                          sendMessage(suggestion)
                        }
                      >

                        {suggestion}

                        <span>
                          →
                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* =================================================
                  INPUT
              ================================================= */}

              <form
                className="input-area"
                onSubmit={handleSubmit}
              >

                <input
                  type="text"
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  placeholder="Ask me about your finances..."
                  disabled={typing}
                />

                <button
                  className="send-btn"
                  type="submit"
                  disabled={
                    !input.trim() || typing
                  }
                >
                  →
                </button>

              </form>

            </section>

            {/* =================================================
                RIGHT — SIDEBAR
                INSIDE SAME BOX
            ================================================= */}

            <aside className="advisor-sidebar">

              {/* SMART GUIDANCE */}

              <div className="side-card highlight">

                <div className="big-icon">
                  ✨
                </div>

                <h3>
                  Smart Financial Guidance
                </h3>

                <p>
                  Get simple and practical
                  suggestions to improve
                  your financial health.
                </p>

              </div>

              {/* HELP */}

              <div className="side-card">

                <h3>
                  What I can help with
                </h3>

                <div className="help-list">

                  <div className="help">

                    <div className="help-icon">
                      💰
                    </div>

                    <div className="help-text">

                      <strong>
                        Saving
                      </strong>

                      <small>
                        Build better saving habits
                      </small>

                    </div>

                  </div>

                  <div className="help">

                    <div className="help-icon">
                      📊
                    </div>

                    <div className="help-text">

                      <strong>
                        Budgeting
                      </strong>

                      <small>
                        Plan your monthly spending
                      </small>

                    </div>

                  </div>

                  <div className="help">

                    <div className="help-icon">
                      🎯
                    </div>

                    <div className="help-text">

                      <strong>
                        Financial Goals
                      </strong>

                      <small>
                        Plan for your future
                      </small>

                    </div>

                  </div>

                  <div className="help">

                    <div className="help-icon">
                      🛡️
                    </div>

                    <div className="help-text">

                      <strong>
                        Emergency Fund
                      </strong>

                      <small>
                        Prepare for unexpected costs
                      </small>

                    </div>

                  </div>

                  <div className="help">

                    <div className="help-icon">
                      📈
                    </div>

                    <div className="help-text">

                      <strong>
                        Investing
                      </strong>

                      <small>
                        Understand investment basics
                      </small>

                    </div>

                  </div>

                  <div className="help">

                    <div className="help-icon">
                      💳
                    </div>

                    <div className="help-text">

                      <strong>
                        Debt
                      </strong>

                      <small>
                        Create a repayment strategy
                      </small>

                    </div>

                  </div>

                </div>

              </div>

              {/* TIP */}

              <div className="tip">

                <div className="tip-icon">
                  💡
                </div>

                <div>

                  <strong>
                    FinWise Tip
                  </strong>

                  <p>
                    Small financial habits can
                    create big improvements over time.
                  </p>

                </div>

              </div>

              {/* DISCLAIMER */}

              <div className="disclaimer">

                <strong>
                  Important
                </strong>

                <p>
                  AI-generated information is for
                  educational purposes only and
                  should not be considered
                  professional financial advice.
                </p>

              </div>

            </aside>

          </div>

        </div>

      </div>
    </>
  );
}

export default AIAdvisor;