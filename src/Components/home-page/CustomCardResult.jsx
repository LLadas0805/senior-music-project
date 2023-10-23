import React from "react";
import { Row, Card } from "react-bootstrap";
import { Link } from 'react-router-dom'; 
import UserIcon from '../Assets/Icons/UserIcon.png'

const linkStyles = {
  textDecoration: 'none', // Remove underline
  color: 'inherit', // Inherit the color from the parent
};

function CardResult({ items, subtitleType }) {
  return (
    <Row className="">
      {items.map((item, i) => (
        <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3" key={i}>
          <Link to={generateLinkTo(item)} style={linkStyles}>
            <Card className="my-2 custom-card">
            <Card.Img
                src={subtitleType === "artist" || subtitleType === "album" ? item.images[0]?.url || UserIcon : item.album.images[0]?.url || UserIcon}
                className={`p-3 card-image${subtitleType === 'artist' ? ' artist-image' : ''}`}
            />
              <Card.Body className="card-body">
                <Card.Title className="card-title">{item.name}</Card.Title>
                <Card.Subtitle className="card-subtitle">
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

function generateLinkTo(item) {
  // Logic to determine the link based on item type
  if (item.type === "artist") {
    return `/artist/${item.id}`;
  } else if (item.type === "album") {
    return `/album/${item.id}`;
  } 
  // Handle other cases if needed
  return "/";
}

function getSubtitle(item, subtitleType) {
  
    if (subtitleType === "artist") {
      return item.type.charAt(0).toUpperCase() + item.type.slice(1);
    } else if (subtitleType === "album") {
      return `${new Date(item.release_date).getFullYear()} • ${item.artists
        .map((artist) => artist.name)
        .join(", ")}`;
    } else {
      return "";
    }

      
  
  
}

export default CardResult;
