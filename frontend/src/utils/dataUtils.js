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
        console.error("Error fetching weekdyas:", error);
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
