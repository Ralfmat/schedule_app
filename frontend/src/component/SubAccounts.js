import { useEffect, useState } from "react";
import { fetchData } from "../utils/apiUtils";
import { fetchCurrentUserId } from "../utils/dataUtils";
import "./SubAccounts.css"; // Import the CSS file

export const SubAccounts = () => {
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userId = await fetchCurrentUserId();
                loadSubAccounts(userId);
            } catch (error) {
                console.error("Error during fetching user id:", error);
            }
        };

        fetchUserId();
    }, []);

    const loadSubAccounts = async (userId) => {
        try {
            const response = await fetchData(`schedule/account/${userId}/sub-accounts`);
            setEmployees(response.data.employee_set);
            setManagers(response.data.manager_set);

            if (response.data.employee_set.length === 0) {
                window.location.href = "/manager";
            } else if (response.data.manager_set.length === 0) {
                window.location.href = "/employee";
            } else {
                setLoading(false);
            }

        } catch (error) {
            console.error("Error during fetching sub accounts:", error);
        }
    };

    const handleEmployeeClick = () => {
        window.location.href = "/employee";
    };

    const handleManagerClick = () => {
        window.location.href = "/manager";
    };

    return (
        <div>
            {loading ? (
                <div className="subaccounts-container"> 
                    <div className="loading-spinner"></div>
                </div>) : (
                <div className="subaccounts-container">
                    <h2 className="title">Select account to see your workload.</h2>
                    <div className="subaccounts-sections">
                        {employees.map((emp, index) => (
                        <div className="subaccount-section">
                            <h3>Employee account</h3>
                            <ul>
                                <li key={index} className="subaccount-item">
                                    <div onClick={handleEmployeeClick} className="to-be-clicked">Log in as employee</div>
                                    <br/>
                                    <div>Employee Id: {emp.id}</div>
                                </li>
                            </ul>
                        </div>
                        ))}
                        {managers.map((man, index) => (
                        <div className="subaccount-section">
                            <h3>Manager account</h3>
                            <ul>
                                <li key={index} className="subaccount-item">
                                    <div onClick={handleManagerClick} className="to-be-clicked">Log in as manager</div>
                                    <br/>
                                    <div>Manager Id: {man.id}</div>
                                </li>
                            </ul>
                        </div>
                        ))}
                    </div>
                </div>
            )
        }
        </div>
        
    );
};

export default SubAccounts;
