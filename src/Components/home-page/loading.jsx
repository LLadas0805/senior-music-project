import React from 'react';
import './loading.css'; // Your CSS for styling the loading screen

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner">
       
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;