import { useEffect, useState } from "react"

export const Test = () => {
    const [messageWithPerm, setMessageWithPerm] = useState("");

    useEffect(() => {
      
    }, [])
    
    return (
        <div>
            <h3>My permission:{messageWithPerm}</h3>
        </div>
    )
};