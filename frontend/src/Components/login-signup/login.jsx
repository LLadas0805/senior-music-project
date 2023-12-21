import React, {useEffect, useState} from 'react'
import {useNavigate, Link} from "react-router-dom"
import axios from "axios"
import './login-signup.css'
import IconLogo from '../Assets/Icons/IconLogo.png'
import PasswordHide from '../Assets/Icons/PasswordHide.png'
import PasswordShown from '../Assets/Icons/PasswordShown.png'



function Login() {

    const history=useNavigate();

    const [useroremail, setUserOrEmail]=useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = useState(null);


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        
    };


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

    async function submit(e){
        e.preventDefault()

        try {

            await axios.post("http://localhost:3000/login", {
                useroremail, password
            })
            .then(res=>{
                if(res.data==="exist"){
                    history("/", {state:{id:useroremail}})
                    window.location.reload();
                } else {
                    alert(res.data);
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
        <div className = 'container'>        
            <div className = 'header'>
                <div className = 'logo'>
                    <img src={IconLogo} width = "100" height = "100"  alt=""/>
                    <div className = 'logotext'>Senior Project  </div>
                </div>
                <div className = 'caption'>
                        <div className = 'text'>Log in</div>
                     
                </div>
            </div>
            

            <form action="POST">
                <div className="inputs">
                <div className="input">
                    <label htmlFor="useroremail">Account Name</label>
                    <div className = "input-text">
                        
                        <input type="text" id = "useroremail" onChange = {(e)=>{setUserOrEmail(e.target.value)}} placeholder = "Account Name" />
                        
                    </div>
                   
                </div>
                <div className="input">
                    <label htmlFor="password">Password</label>
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
                        <button type = "submit" onClick={submit} className = "submit">Log In</button>
                </div>
            </form>
            <div className = "have-account">
                <p> 
                    Don't have an account? <Link to={"/signup"}>Sign up </Link>
                </p>
                
                
            </div>
        </div>
    )
}

export default Login