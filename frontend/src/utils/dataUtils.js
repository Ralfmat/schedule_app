import { fetchData } from "./apiUtils"

export const fetchCurrentAccount = async () => {
    try {
        const response = await fetchData("auth/account/me");
        return response.data;
    } catch (error) {
        console.error("Error fetching current account:", error);
    }
}