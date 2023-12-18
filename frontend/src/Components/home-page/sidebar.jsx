import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate  } from 'react-router-dom';
import './Sidebar.css'; // Import CSS file for styling
import './home.css'
import HomeIcon from '../Assets/Icons/HomeIcon.png'
import HomeIconActive from '../Assets/Icons/HomeIconActive.png'
import SearchIcon from '../Assets/Icons/SearchIcon.png'
import SearchIconActive from '../Assets/Icons/SearchIconActive.png'
import ProfileIcon from '../Assets/Icons/ProfileIcon.png'
import ProfileIconActive from '../Assets/Icons/ProfileIconActive.png'
import IconLogo from '../Assets/Icons/LogoIcon.png'

import axios from "axios"

import wallpaper from '../Assets/Icons/wallpaper.jpg'

const linkStyles = {
  textDecoration: 'none', // Remove underline
  color: 'inherit', // Inherit the color from the parent
};

const Sidebar = () => {
  const [userData, setUserData] = useState(null);

 
  const location = useLocation(); // Get the current URL location
  const navigate = useNavigate(); // Access the history object for navigation
  
 

 

 

  
 
  
  // Function to check if the link is active
  const isActiveLink = (link) => {
    return location.pathname === link;
  };

  
  

  useEffect(() => {
    axios.get("http://localhost:3000/session")
      .then(response => {
        // Handle successful response
        setUserData(response.data); // Assuming the response contains user data
      })
      .catch(error => {
        // Handle error
        console.error("Error fetching user data:", error);
      })
      


  }, []);

 
  const logout = () => {
    axios.get("http://localhost:3000/logout")
      .then(response => {
          setUserData(null);
          window.location.reload();
      })
      .catch(error => {
        // Handle error
        console.error("Error fetching user data:", error);
    });    

    

  }
 
  
  


 
 
 


  return (
    <div className="sidebar"  >

       

        

       
        <div className = 'header-item'>
                <div className = 'logo'>
                 
                    <div className = 'logotext'>Harmony  </div>
                </div>
        </div>
      
        <Link to = {'/'} style={linkStyles}>
          <div className = {`sidebar-item ${isActiveLink('/') ? 'active-tab' : ''}`}>
              <img className = 'sidebar-icon' src = {isActiveLink('/') ? HomeIconActive : HomeIcon }/>
              <h1 className = 'sidebar-text'>Home</h1>

          </div>
        </Link>
        <Link to = {'/search'} style={linkStyles}>
          <div className = {`sidebar-item ${isActiveLink('/search') ? 'active-tab' : ''}`}>
              <img className = 'sidebar-icon' src = {isActiveLink('/search') ? SearchIconActive : SearchIcon }/>
              <h1 className = 'sidebar-text'>Search</h1>

          </div>
        </Link>

        {userData ? ( // Conditionally render user account or login link
        <Link to={`/user/${userData._id}`} style={linkStyles}>
          <div className={`sidebar-item ${isActiveLink(`/user/${userData._id}`) ? 'active-tab' : ''}`}>
            <img className='sidebar-icon' src={isActiveLink(`/user/${userData._id}`) ? ProfileIconActive : ProfileIcon} />
            <h1 className='sidebar-text'>Account</h1>
          </div>
        </Link>
        ) : (
        <Link to={'/login'} style={linkStyles}>
          <div className={`sidebar-item ${isActiveLink('/login') ? 'active-tab' : ''}`}>
            <img className='sidebar-icon' src={isActiveLink('/login') ? ProfileIconActive : ProfileIcon} />
            <h1 className='sidebar-text'>Login</h1>
          </div>
        </Link>
      )}


      {userData ? ( // Conditionally render user account or login link
        
        <div className='logout-item'>
          <div className = "submit-container" >
                      <button type = "submit" onClick={logout} className = "submit">Log Out</button>
          </div>
        </div>
      
        ) : (
        <></>
      )}




      </div>
    
      
   
  );
};

export default Sidebar;