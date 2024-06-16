import { useEffect, useState } from "react";
import { fetchCurrentUserId, fetchCurrentUserAccountDetails } from "../utils/dataUtils";
// import "./Employee.css";

export const Employee = () => {

    useEffect(() => {
        const loadAccountDetails = async () => {
            try {
                const userId = await fetchCurrentUserId();
                const accountDetails = await fetchCurrentUserAccountDetails(userId)
                console.log(accountDetails);
            } catch (error) {
                console.error("Error during setting account details:", error);
            }
        }
        loadAccountDetails();
    }, []);

    

    return (
        <div>

        </div>
    );
};

export default Employee;
