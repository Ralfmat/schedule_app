import axios from "axios";

export const fetchData = async (endpoint) => {
    const config = {
        method: 'get',
        url: `http://127.0.0.1:8000/${endpoint}`,
        headers: {
            "Content-Type": "application/json"
        }
    };
    try {
        return await axios(config);
    } catch (error) {
        throw error;
    }
}