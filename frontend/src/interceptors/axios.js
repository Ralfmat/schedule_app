import axios from "axios";

let refresh = false;

axios.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    if (error.response.status === 401 && !refresh) {
      refresh = true;
      const token = await axios.post(
        "http://127.0.0.1/api/account/login/refresh",
        {
          refresh:localStorage.getItem("refresh_token"),
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (token.status === 200) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token.data.access}`;
        localStorage.setItem("access_token", token.data.access);
        localStorage.setItem("refresh_token", token.data.refresh);

        return axios(error.config);
      }
    }
    refresh = false;
    return error;
  }
);
