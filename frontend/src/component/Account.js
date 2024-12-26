import { useEffect, useState } from "react";
import { fetchCurrentAccount } from "../utils/dataUtils";
import "./Account.css";
import ErrorMessage from "../utils/errorUtlis";

export const Account = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const accountData = await fetchCurrentAccount();
        setAccount(accountData);
      } catch (error) {
        console.error("Failed to fetch account:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  if (loading) {
    return (
      <div className="account-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!account) {
    return <ErrorMessage message="Account details could not be loaded." />;
  }

  return (
    <div className="account-page">
      <div className="account-center">
        <h2 className="account-title">Account Details</h2>
        <div className="account-info">
          <div className="info-item">
            <strong>ID:</strong> {account.id}
          </div>
          <div className="info-item">
            <strong>Username:</strong> {account.username}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {account.email}
          </div>
          <div className="info-item">
            <strong>First Name:</strong> {account.first_name}
          </div>
          <div className="info-item">
            <strong>Last Name:</strong> {account.last_name}
          </div>
          <div className="info-item">
            <strong>Phone Number:</strong> {account.phone_number}
          </div>
          <div className="info-item">
            <strong>Role:</strong> {account.role}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
