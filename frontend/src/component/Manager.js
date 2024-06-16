import { useEffect } from "react";
import { fetchManagerId } from "../utils/dataUtils";

export const Manager = () => {

    useEffect(() => {
        const loadManagerDetails = async () => {
            try {
                const managerId = await fetchManagerId()
                console.log(managerId);
            } catch (error) {
                
            }
        };
        loadManagerDetails();
    }, []);

    return (
        <div>

        </div>
    );
};

export default Manager;
