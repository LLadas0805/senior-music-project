import React from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import './Sidebar.css'; // Import CSS file for styling
import './home.css'
import HomeIcon from '../Assets/Icons/HomeIcon.png'
import HomeIconActive from '../Assets/Icons/HomeIconActive.png'
import SearchIcon from '../Assets/Icons/SearchIcon.png'
import SearchIconActive from '../Assets/Icons/SearchIconActive.png'
import ProfileIcon from '../Assets/Icons/ProfileIcon.png'
import ProfileIconActive from '../Assets/Icons/ProfileIconActive.png'

import wallpaper from '../Assets/Icons/wallpaper.jpg'

const linkStyles = {
  textDecoration: 'none', // Remove underline
  color: 'inherit', // Inherit the color from the parent
};

const Sidebar = () => {


  const location = useLocation(); // Get the current URL location
  
  // Function to check if the link is active
  const isActiveLink = (link) => {
    return location.pathname === link;
  };


  return (
    <div className="sidebar" >
      
        <Link to = {'/home'} style={linkStyles}>
          <div className = {`sidebar-item ${isActiveLink('/home') ? 'active-tab' : ''}`}>
              <img className = 'sidebar-icon' src = {isActiveLink('/home') ? HomeIconActive : HomeIcon }/>
              <h1 className = 'sidebar-text'>Home</h1>

          </div>
        </Link>
        <Link to = {'/search'} style={linkStyles}>
          <div className = {`sidebar-item ${isActiveLink('/search') ? 'active-tab' : ''}`}>
              <img className = 'sidebar-icon' src = {isActiveLink('/search') ? SearchIconActive : SearchIcon }/>
              <h1 className = 'sidebar-text'>Search</h1>

          </div>
        </Link>
        <Link to = {'/'} style={linkStyles}>
          <div className = {`sidebar-item ${isActiveLink('/profile') ? 'active-tab' : ''}`}>
              <img className = 'sidebar-icon' src = {isActiveLink('/profile') ? ProfileIconActive : ProfileIcon }/>
              <h1 className = 'sidebar-text'>Account</h1>

          </div>
        </Link>



      </div>
    
      
   
  );
};

export default Sidebar;