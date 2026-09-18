import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email && password) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <h1>FinWise</h1>

          <p>
            Your money, made simple.
          </p>
        </div>

        <div className="login-content">

          <h2>Welcome back 👋</h2>

          <p className="login-subtitle">
            Sign in to continue to your dashboard
          </p>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <div className="forgot">
              <a href="#">
                Forgot password?
              </a>
            </div>

            <button type="submit">
              Login
            </button>

          </form>

          <p className="signup-text">
            Don't have an account?
            <span> Create one</span>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;