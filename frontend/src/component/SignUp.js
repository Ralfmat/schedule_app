import axios from "axios";
import { useState } from "react";
import "./styles.css";
import { authInterceptor } from "../interceptors/axios";
import { redirectIfLoggedIn } from "../utils/authUtils";

export const SignUp = () => {
  redirectIfLoggedIn();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  axios.interceptors.request.eject(authInterceptor);

  const submit = async (e) => {
    e.preventDefault();

    const newAccount = {
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
        newAccount,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setErrors({});
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
    } catch (error) {
      console.error("Registration error", error);
      if (error.response && error.response.data) {
        const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

        let capitalizedErrors = Object.fromEntries(
          Object.entries(error.response.data).map(([key, messages]) => [
              key,
              Array.isArray(messages)
                ? messages.map(capitalizeFirstLetter)
                : [capitalizeFirstLetter(messages)] // Wrap single message in an array
          ])
      );
        setErrors(capitalizedErrors);
      }
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
            {errors.username && errors.username.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
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
            {errors.email && errors.email.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
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
            {errors.first_name && errors.first_name.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
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
            {errors.last_name && errors.last_name.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
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
              maxLength={9}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {errors.phone_number && errors.phone_number.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
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
            {errors.password && errors.password.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
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
