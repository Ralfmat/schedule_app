import { deleteData, fetchData, postData } from "./apiUtils"

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

export const fetchShifts = async (workday_id, future_only) => {
    try {
        let endpoint = "schedule/shifts/";

        // Build query parameters dynamically
        const params = new URLSearchParams();
        if (workday_id) params.append("workday_id", workday_id);
        if (future_only) params.append("future_only", "true");

        // Append query string to the endpoint if parameters exist
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }

        const response = await fetchData(endpoint);
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts:", error);
    }
};

export const postShift = async (data) => {
    try {
        const request = await postData("schedule/shifts/create/", data);
        return request.data;
    } catch (error) {
        console.error("Error posting shift:", error);
        throw error;
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

export const fetchWeekdays = async () => {
    try {
        const response = await fetchData("schedule/weekdays/");
        return response.data;
    } catch (error) {
        console.error("Error fetching weekdyas:", error);
    }
};

export const fetchWorkdays = async (future_only) => {
    // If future_only is "true" function returns workdays with date equal today or later.
    // If future_only is "false" whole query is retured.
    try {
        const endpoint = future_only
        ? `schedule/workdays/?future_only=${future_only}`
        : `schedule/workdays/`;
        const response = await fetchData(endpoint);
        return response.data;
    } catch (error) {
        console.error("Error fetching workdays:", error);
    }
};

export const postWorkday = async (data) => {
    try {
        const request = await postData("schedule/workdays/create/", data);
        return request.data;
    } catch (error) {
        console.error("Error posting workday:", error);
    }
};

export const deleteWorkday = async (workday_id) => {
    try {
        const request = await deleteData(`schedule/workdays/delete/${workday_id}`);
        return request.data;
    } catch (error) {
        console.error("Error fetching weekdyas:", error);
    }
}
