/**
 * Import necessary modules and components that make up my entire website
 */
import React from "react";
import './App.css';
import Signup from './Components/general/signup';
import Login from './Components/general/login';
import Search from './Components/general/search';
import ArtistPage from './Components/general/artist-page';
import AlbumPage from './Components/general/album-page';
import PlaylistPage from './Components/general/playlist-page';
import UserPage from './Components/general/user-page';
import Sidebar from './Components/general/sidebar'; 
import Home from './Components/general/home'
import GenrePage from './Components/general/genre-page'
import NotFound from './Components/general/not-found'

import { BrowserRouter as Router, Routes, Route} from "react-router-dom"; 

/**
 * Function to render the main application
 */
function App() {
  return (
    <Router>
      <div className='app'>
        {/* Sidebar component */}
        <Sidebar className='sidebar' />
        <div className='main-content'>
          <Routes>
            {/* All the routes and components for the main display */}
            <Route exact path='/' element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<Search />} />
            <Route path="/artist/:artistId" element={<ArtistPage />} />
            <Route path="/album/:albumId" element={<AlbumPage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
            <Route path="/user/:userId" element={<UserPage />} />
            <Route path="/genre/:genreId" element={<GenrePage />} />

            {/* When a route is not found or invalid */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

/* exports this App function as a new module component to be sent to index.js */
export default App;
