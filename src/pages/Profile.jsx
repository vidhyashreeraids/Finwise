import { useEffect, useState } from "react";

const defaultProfile = {
  monthly_income: "",
  budget_goal: "",
  credit_score: "",
  debt_to_income_ratio: "",
  loan_payment: "",
  investment_amount: "",
  subscription_services: "",
  emergency_fund: "",
  rent_or_mortgage: "",
  income_type: "Salary",
};

function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("finwise_profile");

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    localStorage.setItem(
      "finwise_profile",
      JSON.stringify(profile)
    );

    setSaved(true);
  };

  const handleReset = () => {
    localStorage.removeItem("finwise_profile");
    setProfile(defaultProfile);
    setSaved(false);
  };

  return (
    <div className="profile-page">

      <style>{`
        .profile-page {
          min-height: 100vh;
          background: #f6f4ee;
          padding: 35px;
          color: #1d2b26;
          font-family: Arial, sans-serif;
        }

        .profile-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .profile-header {
          margin-bottom: 30px;
        }

        .profile-header h1 {
          margin: 0;
          font-size: 32px;
          color: #1f4238;
        }

        .profile-header p {
          margin-top: 8px;
          color: #68756e;
          font-size: 15px;
        }

        .profile-card {
          background: white;
          border: 1px solid #e3dfd3;
          border-radius: 18px;
          padding: 30px;
          box-shadow: 0 8px 30px rgba(31, 66, 56, 0.06);
        }

        .section-title {
          margin-bottom: 22px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 20px;
          color: #1f4238;
        }

        .section-title p {
          margin: 6px 0 0;
          color: #78837e;
          font-size: 13px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #35463f;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #d8d5ca;
          border-radius: 10px;
          background: #fbfaf6;
          color: #1d2b26;
          font-size: 14px;
          outline: none;
          transition: 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #2f5d50;
          box-shadow: 0 0 0 3px rgba(47, 93, 80, 0.1);
        }

        .field-help {
          font-size: 11px;
          color: #89918d;
        }

        .profile-info {
          margin-top: 25px;
          padding: 16px;
          border-radius: 12px;
          background: #eef3ef;
          border: 1px solid #dce7df;
        }

        .profile-info strong {
          color: #1f4238;
          font-size: 14px;
        }

        .profile-info p {
          margin: 5px 0 0;
          color: #66746d;
          font-size: 12px;
          line-height: 1.5;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid #eeeae0;
        }

        .save-button,
        .reset-button {
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }

        .save-button {
          border: none;
          background: #2f5d50;
          color: white;
        }

        .save-button:hover {
          background: #1f4238;
        }

        .reset-button {
          border: 1px solid #d8d5ca;
          background: white;
          color: #58685f;
        }

        .reset-button:hover {
          background: #f5f3ed;
        }

        .saved-message {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 18px;
          padding: 11px;
          border-radius: 10px;
          background: #e7f1e9;
          color: #2d684d;
          font-size: 13px;
          font-weight: 600;
        }

        @media (max-width: 700px) {
          .profile-page {
            padding: 20px;
          }

          .profile-card {
            padding: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: auto;
          }

          .actions {
            flex-direction: column;
          }

          .save-button,
          .reset-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="profile-container">

        <div className="profile-header">
          <h1>Financial Profile</h1>

          <p>
            Add your financial details to help FinWise
            understand your financial health.
          </p>
        </div>

        <div className="profile-card">

          <div className="section-title">
            <h2>Financial Health Details</h2>

            <p>
              These details will be used by the FinWise
              ML model for personalized financial analysis.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* Monthly Income */}

              <div className="form-group">
                <label htmlFor="monthly_income">
                  Monthly Income (₹)
                </label>

                <input
                  id="monthly_income"
                  name="monthly_income"
                  type="number"
                  min="0"
                  placeholder="Example: 25000"
                  value={profile.monthly_income}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Budget Goal */}

              <div className="form-group">
                <label htmlFor="budget_goal">
                  Monthly Budget Goal (₹)
                </label>

                <input
                  id="budget_goal"
                  name="budget_goal"
                  type="number"
                  min="0"
                  placeholder="Example: 18000"
                  value={profile.budget_goal}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Credit Score */}

              <div className="form-group">
                <label htmlFor="credit_score">
                  Credit Score
                </label>

                <input
                  id="credit_score"
                  name="credit_score"
                  type="number"
                  min="300"
                  max="900"
                  placeholder="Example: 750"
                  value={profile.credit_score}
                  onChange={handleChange}
                  required
                />

                <span className="field-help">
                  Usually between 300 and 900 in India.
                </span>
              </div>

              {/* Debt Ratio */}

              <div className="form-group">
                <label htmlFor="debt_to_income_ratio">
                  Debt-to-Income Ratio (%)
                </label>

                <input
                  id="debt_to_income_ratio"
                  name="debt_to_income_ratio"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Example: 20"
                  value={profile.debt_to_income_ratio}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Loan Payment */}

              <div className="form-group">
                <label htmlFor="loan_payment">
                  Monthly Loan Payment (₹)
                </label>

                <input
                  id="loan_payment"
                  name="loan_payment"
                  type="number"
                  min="0"
                  placeholder="Example: 3000"
                  value={profile.loan_payment}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Investment */}

              <div className="form-group">
                <label htmlFor="investment_amount">
                  Monthly Investment (₹)
                </label>

                <input
                  id="investment_amount"
                  name="investment_amount"
                  type="number"
                  min="0"
                  placeholder="Example: 2000"
                  value={profile.investment_amount}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Subscriptions */}

              <div className="form-group">
                <label htmlFor="subscription_services">
                  Monthly Subscriptions (₹)
                </label>

                <input
                  id="subscription_services"
                  name="subscription_services"
                  type="number"
                  min="0"
                  placeholder="Example: 500"
                  value={profile.subscription_services}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Emergency Fund */}

              <div className="form-group">
                <label htmlFor="emergency_fund">
                  Emergency Fund (₹)
                </label>

                <input
                  id="emergency_fund"
                  name="emergency_fund"
                  type="number"
                  min="0"
                  placeholder="Example: 30000"
                  value={profile.emergency_fund}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Rent */}

              <div className="form-group">
                <label htmlFor="rent_or_mortgage">
                  Rent / Mortgage (₹)
                </label>

                <input
                  id="rent_or_mortgage"
                  name="rent_or_mortgage"
                  type="number"
                  min="0"
                  placeholder="Example: 8000"
                  value={profile.rent_or_mortgage}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Income Type */}

              <div className="form-group">
                <label htmlFor="income_type">
                  Income Type
                </label>

                <select
                  id="income_type"
                  name="income_type"
                  value={profile.income_type}
                  onChange={handleChange}
                >
                  <option value="Salary">
                    Salary
                  </option>

                  <option value="Freelance">
                    Freelance
                  </option>

                  <option value="Business">
                    Business
                  </option>

                  <option value="Mixed">
                    Mixed Income
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

            </div>

            {/* Information box */}

            <div className="profile-info">
              <strong>
                🧠 Why does FinWise need this?
              </strong>

              <p>
                FinWise combines your financial profile
                with your transaction history to estimate
                your financial stress level and provide
                personalized recommendations.
              </p>
            </div>

            {/* Buttons */}

            <div className="actions">

              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
              >
                Reset
              </button>

              <button
                type="submit"
                className="save-button"
              >
                Save Financial Profile
              </button>

            </div>

            {saved && (
              <div className="saved-message">
                ✓ Financial profile saved successfully
              </div>
            )}

          </form>

        </div>

      </div>

    </div>
  );
}

export default Profile;