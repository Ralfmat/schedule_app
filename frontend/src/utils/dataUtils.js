import { fetchData } from "./apiUtils"

export const fetchCurrentUserId = async () => {
    try {
        const response = await fetchData("auth/account/get-current-user-id");
        return response.data.id;
    } catch (error) {
        console.error("Error fetching user ID:", error);
        throw error;
    }
};

export const fetchCurrentUserAccountDetails = async (userId) => {
    try {
        const response = await fetchData(`auth/account/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user account details:", error);
        throw error;
    }
};

export const fetchManagerId = async () => {
    const userId = await fetchCurrentUserId();
    const response = await fetchData(`schedule/account/${userId}/sub-accounts`);
    return response.data.manager_set[0].id
}

export const fetchCurrentUserManagerDetails = async (userId) => {
    try {
        const response = await fetchData(`auth/schedule/manager/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user account details:", error);
        throw error;
    }
};