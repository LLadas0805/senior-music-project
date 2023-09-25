import React, {useEffect, useState} from 'react'
import {useNavigate, Link} from "react-router-dom"
import axios from "axios"
import './login-signup.css'
import IconLogo from '../Assets/Icons/IconLogo.png'




function Signup () {

    const history=useNavigate();

    const [user, setUser]=useState('')
    const [email, setEmail]=useState('')
    const [password, setPassword] = useState('')

    async function submit(e){
        e.preventDefault()
         
        

        try {

            await axios.post("http://localhost:3000/signup", {
                user, email, password
            })
            .then(res=>{
                if(res.data==="exist"){
                    alert("User already exists")
                    
                } else if(res.data==="not exist"){
                    console.log("Hello")
                    history("/home", {state:{id:user}})
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
                <div className="logotext">Harmony</div>
                </div>
                <div className="caption">
                <div className="text">Sign up for a world of music.</div>
                </div>
            </div>
            <form action="POST">
                <div className="inputs">
                <div className="input">
                    <label htmlFor="username">Choose a display name</label>
                    <input
                    type="text"
                    id="username"
                    onChange={(e) => {
                        setUser(e.target.value);
                    }}
                    placeholder="Enter a display name"
                    />
                </div>
                <div className="input">
                    <label htmlFor="email">What's your email?</label>
                    <input
                    type="email"
                    id="email"
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                    placeholder="Enter your email address"
                    />
                </div>
                <div className="input">
                    <label htmlFor="password">Create a password</label>
                    <input
                    type="password"
                    id="password"
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                    placeholder="Enter a password"
                    />
                </div>
                </div>

                
                <div className = "submit-container" >
                        <button type = "submit" onClick={submit} className = "submit">Sign Up</button>
                
                </div>
            </form>

            <div className="have-account text-center">
                <p>
                Already have an account? <a href="/login">Log in</a>.
                </p>
            </div>
            </div>
        </div>
        </div>

       
    )
}

export default Signup