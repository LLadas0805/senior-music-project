import React from "react";
import './App.css';
import Signup from './Components/login-signup/signup';
import Login from './Components/login-signup/login';
import Home from './Components/home-page/home';
import { BrowserRouter as Router, Routes, Route, Link} from "react-router-dom"; 

import { ChatEngine } from 'react-chat-engine'


function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path = '/' element = {<Login/>}/>
          <Route path="/login" element = {<Login/>}/>
          <Route path="/signup" element = {<Signup/>}/>
          <Route path="/home" element = {<Home/>}/>
        </Routes>
        
      </div>
    </Router>
   
  );
}

export default App;
