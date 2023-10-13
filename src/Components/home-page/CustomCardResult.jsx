import React from "react";
import { Row, Card } from "react-bootstrap";
import UserIcon from '../Assets/Icons/UserIcon.png'

function CardResult({ items, subtitleType }) {
  return (
    <Row className="">
      {items.map((item, i) => (
        <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3" key={i}>
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
        </div>
      ))}
    </Row>
  );
}



function getSubtitle(item, subtitleType, all) {
  if (all === "false" ) {
    if (subtitleType === "artist") {
      return item.type.charAt(0).toUpperCase() + item.type.slice(1);
    } else if (subtitleType === "album") {
      return `${new Date(item.release_date).getFullYear()} • ${item.artists
        .map((artist) => artist.name)
        .join(", ")}`;
    } else {
      return "";
    }
  } else {
    if (subtitleType === "artist" || subtitleType === "album" || subtitleType === "song") {
      return item.type.charAt(0).toUpperCase() + item.type.slice(1);
    } else {
      return "";
    }
      
    }
  
  
}

export default CardResult;
