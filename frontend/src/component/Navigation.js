import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import React, { useState, useEffect } from "react";
import axios from "axios";

export function Navigation() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("access_token") !== null) {
      (async () => {
        try {
          const { data } = await axios.get("http://127.0.0.1:8000/auth/account/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          });
          localStorage.setItem("user_role", data.role);
          setIsAuth(true);
          
        } catch (e) {
          setIsAuth(false);
          if (e.response.status === 401) {
            // Clearing tokens in case there is one left in storage which is inactive. It fixes infinity loop with requests for auth
            localStorage.clear();
            window.location.href = "/sign-in";
          } else {
            console.log(e);
          }
        }
      })();
    }
  }, [isAuth]);

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="/">Schedule App</Navbar.Brand>
        <Nav className="me-auto">
          {isAuth ? <Nav.Link href="/">Home</Nav.Link> : null}
          {isAuth ? <Nav.Link href="/calendar">Calendar</Nav.Link> : null}
          {isAuth && localStorage.getItem("user_role") === "MANAGER" ? <Nav.Link href="/dashboard">Dashboard</Nav.Link> : null}
        </Nav>
        <Nav>
          {isAuth ? <Nav.Link href="/account">Account</Nav.Link> : null}
          {isAuth ? (
            <Nav.Link href="/logout">Logout</Nav.Link>
          ) : (
            <>
              <Nav.Link href="/sign-in">Sign In</Nav.Link>
              <Nav.Link href="/sign-up">Sign Up</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar>
    </div>
  );
}
