import { useEffect, useState } from "react"
import { fetchData } from "../utils/apiUtils"
import { fetchCurrentUserId } from "../utils/dataUtils"

export const SubAccounts = () => {
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]);

    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const userId = await fetchCurrentUserId();
                // console.log(userId);
                const response = await fetchData(`schedule/account/${userId}/sub-accounts`);
                setEmployees(response.data.employee_set);
                setManagers(response.data.manager_set);
            } catch (error) {
                console.error("Error during fetching sub accounts:", error);
            }
        };
        loadAccounts();
    }, []);
    return (
        <div>
            <h2>Employees</h2>
            <ul>
                {employees.map(emp => (
                    <>
                    <li>Account Id:{emp.account}</li>
                    
                    <li>Employee page</li>
                    <br/>
                    </>
                ))}
            </ul>

            <h2>Managers</h2>
            <ul>
                {managers.map(man => (
                    <>
                    <li>Account Id:{man.account}</li>
                    
                    <li>Manager page</li>
                    <br/>
                    </>
                ))}
            </ul>
        </div>
    );
};