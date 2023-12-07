import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css'
import axios from "axios"

function Home() {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Make an API call to fetch user data from the backend
        axios.get("http://localhost:3000/home", { withCredentials: true })
          .then(response => {
            // Handle successful response
            setUserData(response.data); // Assuming the response contains user data
          })
          .catch(error => {
            // Handle error
            console.error("Error fetching user data:", error);
        });
    }, []);


    return (
        <div className="homepage" style={{ color: 'white' }}>
            <h1>HELLO THERE</h1>
            {userData && (
                <div>
                    <p>User ID: {userData.id}</p>
                    <p>Account Name: {userData.accountname}</p>
                   
                </div>
            )}
        </div>
    )
}

export default Home;