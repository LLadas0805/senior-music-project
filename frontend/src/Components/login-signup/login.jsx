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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        
    };

    async function submit(e){
        e.preventDefault()

        try {

            await axios.post("http://localhost:3000/", {
                useroremail, password
            })
            .then(res=>{
                if(res.data==="exist"){
                    history("/", {state:{id:useroremail}})
                    window.location.reload();
                } else if(res.data==="not exist"){
                    alert("User is not signed up")
                } else if(res.data==="incorrect"){
                    alert("Wrong Credentials")
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
                        <div className = 'text'>Log in to Senior Project</div>
                     
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
                    Don't have an account? <Link to={"/signup"}>Sign up for Harmony </Link>
                </p>
                
                
            </div>
        </div>
    )
}

export default Login