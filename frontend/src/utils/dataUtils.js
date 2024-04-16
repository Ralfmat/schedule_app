import { fetchData } from "./apiUtils"

export const fetchCurrentUserId = async () => {
    try {
        const response = await fetchData("auth/account/get-current-user-id");
        return response.data.id;
    } catch (error) {
        console.error("Error fetching user ID:", error);
        throw error;
    }
}