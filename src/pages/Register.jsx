import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="brand">
          <h1>FinWise</h1>
          <p>Your money, made simple.</p>
        </div>

        <div className="auth-content">
          <h2>Create your account</h2>

          <p className="subtitle">
            Start managing your finances smarter
          </p>

          <input
            type="text"
            placeholder="Full name"
          />

          <input
            type="email"
            placeholder="Email"
          />

          <input
            type="password"
            placeholder="Password"
          />

          <button className="login-btn">
            Create Account
          </button>

          <p className="register-text">
            Already have an account?{" "}
            <Link to="/">Login</Link>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Register;