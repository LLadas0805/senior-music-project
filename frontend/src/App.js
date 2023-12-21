import React from "react";
import './App.css';
import Signup from './Components/login-signup/signup';
import Login from './Components/login-signup/login';
import Search from './Components/search-page/search';
import ArtistPage from './Components/profile-page/artist-page';
import AlbumPage from './Components/profile-page/album-page';
import PlaylistPage from './Components/profile-page/playlist-page';
import UserPage from './Components/profile-page/user-page';
import Sidebar from './Components/home-page/sidebar'; 
import Home from './Components/home-page/home'
import GenrePage from './Components/profile-page/genre-page'
import NotFound from './Components/misc-page/not-found'


import { BrowserRouter as Router, Routes, Route, Link} from "react-router-dom"; 




function App() {
  return (
    <Router>
      <div className = 'app'>
        <Sidebar className = 'sidebar'/>
        <div className = 'main-content'>
        <Routes>
          <Route exact path = '/' element = {<Home/>}/>
          <Route path="/login" element = {<Login/>}/>
          <Route path="/signup" element = {<Signup/>}/>
        
          <Route path="/search" element = {<Search/>}/>
          <Route path="/artist/:artistId" element={<ArtistPage/>} />
          <Route path="/album/:albumId" element={<AlbumPage/>} />
          <Route path="/playlist/:playlistId" element={<PlaylistPage/>} />
          <Route path="/user/:userId" element={<UserPage/>} />
        
          <Route path="/genre/:genreId" element={<GenrePage/>} />

          {/* Not Found Route */}
          <Route path='*' element={<NotFound />} />

        </Routes>
        </div>
        
      </div>
    </Router>
   
  );
}

export default App;
