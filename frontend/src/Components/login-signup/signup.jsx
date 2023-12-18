import React, {useEffect, useState} from 'react'
import {useNavigate, Link} from "react-router-dom"
import axios from "axios"
import './login-signup.css'
import IconLogo from '../Assets/Icons/IconLogo.png'
import PasswordHide from '../Assets/Icons/PasswordHide.png'
import PasswordShown from '../Assets/Icons/PasswordShown.png'


function Signup () {

    const history=useNavigate();

    const [user, setUser]=useState('')
    const [account, setAccount]=useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = useState(null);


    useEffect(() => {

        


        // Make an API call to fetch user data from the backend
        axios.get("http://localhost:3000/session")
          .then(response => {
            // Handle successful response
            setUserData(response.data); // Assuming the response contains user data
            if (response.data) {
                history("/");
            }
          })
          .catch(error => {
            // Handle error
            console.error("Error fetching user data:", error);
        });
        
        


    }, []);
   

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        
    };

    async function submit(e){
        e.preventDefault()
         
        

        try {

            await axios.post("http://localhost:3000/signup", {
                user, account, password
            })
            .then(res=>{
                if(res.data==="exist"){
                    alert("User already exists")
                    
                } else if(res.data==="not exist"){
                    console.log("Hello")
                    history("/", {state:{id:user}})
                    window.location.reload();
                } else if (res.data === "invalid password") {
                    alert("Please make sure password is at least 8 characters and has one special character and number!");
                }
            })
            .catch(e=> {
                alert("Wrong details")
                console.log(e);
            })

        } catch(e) {
            console.log(e)
        }
    }
    
    return (
        
        <div className="container">
        <div className="row justify-content-center">
            <div className="col-md-6">
            <div className="header text-center">
                <div className="logo">
                <img src={IconLogo} width="100" height="100" alt="" />
                <div className="logotext">Senior Project </div>
                </div>
                <div className="caption">
                <div className="text">Sign up.</div>
                </div>
            </div>
            <form action="POST">
                <div className="inputs">
                <div className="input">
                    <label htmlFor="username">Choose a display name</label>
                    <div className = "input-text">
                        <input
                        type="text"
                        id="username"
                        onChange={(e) => {
                            setUser(e.target.value);
                        }}

                        placeholder="Enter a display name"
                        required 
                        />
                        
                    </div>
                   
                </div>
                <div className="input">
                    <label htmlFor="accountname">Choose an account name</label>
                    <div className = "input-text">
                        <input
                        type="text"
                        id="accountname"
                        onChange={(e) => {
                            setAccount(e.target.value);
                        }}

                        placeholder="Enter an account name"
                        required 
                        />
                        
                    </div>
                   
                </div>
                <div className="input">
                    <label htmlFor="password">Create a password</label>
                    <div className = "input-text">
                        <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                        placeholder="Enter a password"
                        required
                        />
                        <button type = "button" 
                        className="password-button"
                        onClick={togglePasswordVisibility}>
                            <img src={showPassword ? PasswordShown : PasswordHide}/>
                        </button>
                    </div>
                </div>
                </div>

                
                <div className = "submit-container" >
                        <button type = "submit" onClick={submit} className = "submit">Sign Up</button>
                
                </div>
            </form>

            <div className="have-account text-center">
                <p>
                Already have an account? <Link to={"/login"}>Log in</Link>.
                </p>
            </div>
            </div>
        </div>
        </div>

       
    )
}



export default Signup