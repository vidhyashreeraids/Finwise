import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Login button clicked");

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>FinWise</h1>
          <p>Your money, made simple.</p>
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
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                required
              />
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