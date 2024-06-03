import axios from "axios";

let refresh = false;
// TODO: confiugre response interceptor so it is clear and working
//       it should refresh access token 

// export const refreshTokenInterceptor = axios.interceptors.response.use(
//   (resp) => resp,
//   async (error) => {
//     console.log(error);
//     if (error.response.status === 401 && !refresh) {
//       refresh = true;
//       const token = await axios.post(
//         "http://127.0.0.1/auth/account/login/refresh",
//         {
//           refresh: localStorage.getItem("refresh_token"),
//         },
//         {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true,
//         }
//       );
//       if (token.status === 200) {
//         axios.defaults.headers.common[
//           "Authorization"
//         ] = `Bearer ${token.data.access}`;
//         localStorage.setItem("access_token", token.data.access);
//         localStorage.setItem("refresh_token", token.data.refresh);

//         return axios(error.config);
//       }
//     }
//     refresh = false;
//     return error;
//   }
// );

export const authInterceptor  = axios.interceptors.request.use(
  function (config) {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      window.location.href = "/sign-in";
    }
    return config;
  },
  (error) => Promise.reject(error)
);
