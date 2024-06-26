// Import modules and assets
import React from "react";
import { Row, Card } from "react-bootstrap";
import { Link } from 'react-router-dom'; 
import UserIcon from '../Assets/Icons/UserIcon.png'
import UserProfileIcon from '../Assets/Icons/UserProfileIcon.png'
import GenreIcon from '../Assets/Icons/GenreIcon.png'

// Style for links
const linkStyles = {
  textDecoration: 'none', // Remove underline
  color: 'inherit', // Inherit the color from the parent
};

// Component to render cards based on items and subtitleType
function CardResult({ items, subtitleType, singleRow = false }) {
  console.log('ITEMS: ', items);
  return (
    <Row className={`${singleRow === true ? '' : ''}`}>
      {/* Map through items to render cards */}
      {items.map((item, i) => (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" key={i}>
          <Link to={generateLinkTo(item, subtitleType)} style={linkStyles}>
            <Card className=" custom-card">
              <div className=" image-container">
                <img
                  // Conditional rendering for different item types
                  src={
                    subtitleType === "user" 
                      ? UserProfileIcon 
                      : subtitleType === "genre" 
                        ? GenreIcon 
                        : (
                            subtitleType === "artist" || subtitleType === "album" || subtitleType === "album-artist" || subtitleType === "playlist"
                            ? (
                                item.images && item.images.length > 0
                                  ? (
                                      item.images[0]?.url || (
                                        item.album && item.album.images && item.album.images.length > 0
                                          ? item.album.images[0]?.url || UserIcon
                                          : UserIcon
                                      )
                                    )
                                  : (
                                      item.album && item.album.images && item.album.images.length > 0
                                        ? item.album.images[0]?.url || UserIcon
                                        : UserIcon
                                    )
                              )
                            : (
                                item.album && item.album.images && item.album.images.length > 0
                                  ? item.album.images[0]?.url || UserIcon
                                  : UserIcon
                              )
                          )
                  }
                  // Add classes based on the subtitleType
                  className={`p-3 card-image${(subtitleType === 'artist' || subtitleType === 'user') ? ' artist-image' : ''}`}
                />
              </div>
              <Card.Body className="card-body">
                <Card.Title className="card-title">{item.name || item.username || item.charAt(0).toUpperCase() + item.slice(1)}</Card.Title>
                <Card.Subtitle className="card-subtitle">
                  {/* Get subtitle based on the subtitleType */}
                  {getSubtitle(item, subtitleType)}
                </Card.Subtitle>
              </Card.Body>
            </Card>
          </Link>
        </div>
      ))}
    </Row>
  );
}

// Generate link based on item type and subtitleType
function generateLinkTo(item, subtitleType) {
  // Logic to determine the link based on item type
  if (item.type === "artist") {
    return `/artist/${item.id}`;
  } else if (item.type === "album") {
    return `/album/${item.id}`;
  } else if (item.type === "playlist") {
    return `/playlist/${item.id}`;
  } else if (item.type === "genre") {
    return `/genre/${item.name}`;
  } else if (item.accountname) {
    return `/user/${item._id}`;
  } else if (subtitleType === 'genre') {
    return `/genre/${item}`;
  } else if (subtitleType === 'song') {
    return `/album/${item.album.id}`
  }
  // Handle other cases if needed
  return "/";
}

// Get subtitle based on item and subtitleType
function getSubtitle(item, subtitleType) {
  // Check subtitleType and return appropriate subtitle
  if (subtitleType === "artist") {
    return item.type.charAt(0).toUpperCase() + item.type.slice(1);
  } else if (subtitleType === "album") {
    return `${new Date(item.release_date).getFullYear()} • ${item.artists
      .map((artist) => artist.name)
      .join(", ")}`;
  } else if (subtitleType === "song") {
    return `${new Date(item.album.release_date).getFullYear()} • ${item.artists
      .map((artist) => artist.name)
      .join(", ")}`;
  } else if (subtitleType === "user") {
    return "User";
  } else if (subtitleType === "playlist") {
    return "Playlist";
  } else if (subtitleType === "genre") {
    return "Genre & Mood"; 
  } else if (subtitleType === "album-artist") {
    return item.album_type.charAt(0).toUpperCase() + item.album_type.slice(1);
  } else {
    return item.type || "";
  }
}

export default CardResult;
