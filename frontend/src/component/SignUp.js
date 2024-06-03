import axios from "axios";
import { useState } from "react";
import "./styles.css";
import { authInterceptor } from "../interceptors/axios";

export const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  axios.interceptors.request.eject(authInterceptor);

  const submit = async (e) => {
    e.preventDefault();

    const newUser = {
      username: username,
      email: email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      password: password,
    };

    const account = {
      email: email,
      password: password
    }

    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/auth/account/register",
        newUser,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Registration error", error);
    }

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
      console.error("Error with logging after successful registration", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="Auth-form-container">
      <form className="Auth-form" onSubmit={submit}>
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign Up</h3>
          <div className="form-group mt-3">
            <label>Username</label>
            <input
              className="form-control mt-1"
              placeholder="Enter username"
              name="username"
              type="text"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Email</label>
            <input
              className="form-control mt-1"
              placeholder="Enter email"
              name="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>First Name</label>
            <input
              className="form-control mt-1"
              placeholder="Enter first name"
              name="firstName"
              type="text"
              value={firstName}
              required
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Last Name</label>
            <input
              className="form-control mt-1"
              placeholder="Enter last name"
              name="lastName"
              type="text"
              value={lastName}
              required
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Phone Number</label>
            <input
              className="form-control mt-1"
              placeholder="Enter phone number"
              name="phoneNumber"
              type="tel"
              value={phoneNumber}
              required
              onChange={(e) => setPhoneNumber(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary mt-1"
              onClick={togglePasswordVisibility}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button type="submit" className="btn btn-primary">
              Register
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
