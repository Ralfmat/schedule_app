import {useEffect} from "react"
import axios from "axios";

export const Logout = () => {
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.post(
                    "http://127.0.0.1:8000/auth/account/logout",
                    {
                        refresh_token:localStorage.getItem('refresh_token')
                    },
                    {
                      headers: { "Content-Type": "application/json" },
                      withCredentials: true
                    }
                  );
                  localStorage.clear();
                  axios.defaults.headers.common['Authorization'] = null;
                  window.location.href = '/sign-in'
            } catch (e) {
                console.log('logout not working', e);
            }
        })();
    }, []);
    return (
        <div></div>
    )
}