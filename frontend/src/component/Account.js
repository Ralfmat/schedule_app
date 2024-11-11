import { useEffect, useState } from "react";
import { fetchData } from "../utils/apiUtils";
import { fetchCurrentAccount } from "../utils/dataUtils";
import "./Account.css"; // Import the CSS file
import ErrorMessage from "../utils/errorUtlis";

export const Account = () => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchAccount = async () => {
            const account = await fetchCurrentAccount();
            // const account = null
            setAccount(account);
            setLoading(false);
        };
        fetchAccount();
    }, []);

    if (loading) return <div className="account-container"> 
                            <div className="loading-spinner"></div>
                        </div>
    if (!account) return <ErrorMessage message="Account details could not be loaded." />;

    return (
        <div className="account-container">
            <h2 className="title">Account details.</h2>
            <p><strong>ID:</strong> {account.id}</p>
            <p><strong>Username:</strong> {account.username}</p>
            <p><strong>Email:</strong> {account.email}</p>
            <p><strong>First Name:</strong> {account.first_name}</p>
            <p><strong>Last Name:</strong> {account.last_name}</p>
            <p><strong>Phone Number:</strong> {account.phone_number}</p>
        </div>
    );
};

export default Account;
