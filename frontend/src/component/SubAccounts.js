import { useEffect, useState } from "react"
import { fetchData } from "../utils/apiUtils"
import { fetchCurrentUserId } from "../utils/dataUtils"

export const SubAccounts = () => {
    const [accounts, setAccounts] = useState("")
    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const userId = await fetchCurrentUserId();
                const response = await fetchData(`schedule/account/${userId}/sub-accounts`);
                console.log(response.data.employee_set[0]);
                setAccounts(response.data);
            } catch (error) {
                console.error("Error during fetching sub accounts:", error);
            }
        };
        loadAccounts();
    }, []);
    return (
        <div className="list-group">
            {/* {accounts.employee_set.map((employee) => (
                <div key={employee.id} className="list-group-item">
                    Hej jestem employee: {employee.id}
                </div>
            ))} */}
            {/* {accounts.employee_set.account} */}
        </div>
    );
};