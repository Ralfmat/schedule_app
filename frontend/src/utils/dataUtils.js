import { fetchData } from "./apiUtils"

export const fetchCurrentAccount = async () => {
    try {
        const response = await fetchData("auth/account/me");
        return response.data;
    } catch (error) {
        console.error("Error fetching current account:", error);
    }
};

export const fetchAvailability = async (workday_id) => {
    try {
        const endpoint = workday_id
        ? `schedule/availability/?workday_id=${workday_id}` 
        : "schedule/availability/";

        const response = await fetchData(endpoint);
        return response.data;
    } catch (error) {
        console.error("Error fetching availabilities:", error);
    }
};

export const fetchShifts = async (workday_id) => {
    try {
        const endpoint = workday_id
        ? `schedule/shifts/?workday_id=${workday_id}` 
        : "schedule/shifts/";

        const response = await fetchData(endpoint);
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts:", error);
    }
};

export const fetchAssignments = async (workday_id) => {
    try {
        const endpoint = workday_id
        ? `schedule/assignments/?workday_id=${workday_id}` 
        : "schedule/assignments/";

        const response = await fetchData(endpoint);
        return response.data;
    } catch (error) {
        console.error("Error fetching assignments:", error);
    }
};