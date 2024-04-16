import { useEffect, useState } from "react";
import { fetchData } from "../utils/apiUtils"
import axios from "axios";

export const Home = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchData(`auth/home`);
        setMessage(data.message);
      } catch (error) {
        console.error(error); 
      }
    })();
  }, []);

  return (
    <div className="form-signin mt-5 text-center">
      <h3>{message}</h3>
    </div>
  );
};