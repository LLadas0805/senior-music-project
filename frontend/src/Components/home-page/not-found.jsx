import React from 'react';
import './loading.css'; // Your CSS for styling the loading screen
import './not-found.css';
import SearchIcon from '../Assets/Icons/SearchIcon.png'
import { Link  } from 'react-router-dom';

const linkStyles = {
  
  };

const NotFound = () => {
  return (
    <div className="loading-screen">
        <div className = 'not-found'>
            <img src = {SearchIcon} style={{ width: '200px', height: '200px' }}/>
            <div>
                <div>
                    <h1 className="not-found-caption">Page not found</h1>
                    <Link to = {"/"} style={linkStyles} className="not-found-caption">Return home</Link>
                </div>
            </div>
        </div>
    </div>
  );
};

export default NotFound;