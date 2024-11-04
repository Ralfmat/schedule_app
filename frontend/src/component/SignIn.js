import axios from "axios";
import { useState } from "react";
import { redirectIfLoggedIn } from "../utils/authUtils";
import { authInterceptor } from "../interceptors/axios";
import "./SignIn.css";

export const SignIn = () => {
  redirectIfLoggedIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  axios.interceptors.request.eject(authInterceptor);

  const submit = async (e) => {
    e.preventDefault();

    const account = {
      email: email,
      password: password,
    };

    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/auth/account/login",
        account,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      localStorage.clear();
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      window.location.href = "/";
      
    } catch (error) {
      console.error("Logging error", error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    // Reset errors whenever there's a change in input
    setErrors({});
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else if (e.target.name === "password") {
      setPassword(e.target.value);
    }
  };

  return (
    <div className="Auth-form-container">
      <form className="Auth-form" onSubmit={submit}>
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign In</h3>
          <div className="form-group mt-3">
            <label>Email</label>
            <input
              className="form-control mt-1"
              placeholder="Enter email"
              name="email"
              type="email"
              value={email}
              required
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group mt-3">
            <label>Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-control mt-1"
              placeholder="Enter password"
              value={password}
              required
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="btn btn-outline-secondary mt-1"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.detail && <p className="error">{errors.detail}</p>}
          <div className="d-grid gap-2 mt-3">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
