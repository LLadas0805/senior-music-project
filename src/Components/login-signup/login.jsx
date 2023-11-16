import React, {useEffect, useState} from 'react'
import {useNavigate, Link} from "react-router-dom"
import axios from "axios"
import './login-signup.css'
import IconLogo from '../Assets/Icons/IconLogo.png'



function Login() {

    const history=useNavigate();

    const [useroremail, setUserOrEmail]=useState('')
    const [password, setPassword] = useState('')

    async function submit(e){
        e.preventDefault()

        try {

            await axios.post("http://localhost:3000/", {
                useroremail, password
            })
            .then(res=>{
                if(res.data==="exist"){
                    history("/home", {state:{id:useroremail}})
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
                    <div className = 'logotext'>Harmony  </div>
                </div>
                <div className = 'caption'>
                        <div className = 'text'>Log in to Harmony</div>
                     
                    </div>
            </div>
            

            <form action="POST">
                <div className="inputs">
                <div className="input">
                    <label htmlFor="useroremail">Email or username</label>
                    <div className = "input-text">
                        
                        <input type="text" id = "useroremail" onChange = {(e)=>{setUserOrEmail(e.target.value)}} placeholder = "Email or username" />
                        
                    </div>
                   
                </div>
                <div className="input">
                    <label htmlFor="password">Password</label>
                    <div className = "input-text">
                        <input type="password"  id = "password" onChange = {(e)=>{setPassword(e.target.value)}} placeholder = "Password"/>
                    </div>
                   
                </div>
                </div>

                
                <div className = "submit-container" >
                        <button type = "submit" onClick={submit} className = "submit">Log In</button>
                </div>
            </form>
            <div className = "have-account">
                <p> 
                    Don't have an account? <a href ="/signup">Sign up for Harmony</a>
                </p>
                
                
            </div>
        </div>
    )
}

export default Login