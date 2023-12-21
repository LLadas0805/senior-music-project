// Import modules, components and styling
import React from 'react';
import './loading.css'; 

// Renders simple loading screen
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