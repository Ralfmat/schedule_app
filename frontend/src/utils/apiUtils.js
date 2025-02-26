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
};

export const postData = async (endpoint, data) => {
    const config = {
        method: 'post',
        url: `http://127.0.0.1:8000/${endpoint}`,
        headers: {
            "Content-Type": "application/json"
        },
        data: data // Attach the data payload to the request
    };
    try {
        const response = await axios(config);
        return response.data; // Return the response data
    } catch (error) {
        throw error;
    }
};

export const patchData = async (endpoint, data) => {
    const config = {
      method: 'patch',
      url: `http://127.0.0.1:8000/${endpoint}`,
      headers: {
        "Content-Type": "application/json"
      },
      data: data // Attach the data payload to the request
    };
    
    try {
      const response = await axios(config);
      return response.data; // Return the response data
    } catch (error) {
      throw error;
    }
  };

export const deleteData = async (endpoint) => {
    const config = {
        method: 'delete',
        url: `http://127.0.0.1:8000/${endpoint}`,
        headers: {
            "Content-Type": "application/json"
        }
    };
    try {
        const response = await axios(config);
        return response.data; // Return the response data, if any
    } catch (error) {
        throw error; // Propagate the error to the caller
    }
};