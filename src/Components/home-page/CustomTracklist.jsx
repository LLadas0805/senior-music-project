import React from "react";
import { Row, Col } from "react-bootstrap";

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${minutes}:${formattedSeconds}`;
}

function CustomTracklist({ items }) {
  return (
    <Row className="pb-5">
      {items.length === 0 ? (
        <p>No items to display</p>
      ) : (
        <div>
          <div className="tracklist-top">
            <span className="track-number">#</span>
            <div className="album-head-cover">
              <span className="album-head">Title</span>
            </div>
            <div className="name-artist">
              <span className="song-name"></span>
              <span className="artist-name"></span>
            </div>
            <span className="album-name">Album</span>
            <span className="track-number">Duration</span>
          </div>
          <hr className="separator" />
          {items.map((item, index) => (
            <Col key={item.id} xs={12}>
              <div className="tracklist-item">
                <span className="track-number">{index + 1}</span>
                <div className="album-cover">
                  <img src={item.album.images[0].url} alt={item.name} />
                </div>
                <div className="name-artist">
                  <span className="song-name">{item.name}</span>
                  <span className="artist-name">
                    {item.artists.map((artist) => artist.name).join(", ")}
                  </span>
                </div>
                <span className="album-name">{item.album.name}</span>
                <span className="song-length">
                  {formatDuration(item.duration_ms)}
                </span>
              </div>
            </Col>
          ))}
        </div>
      )}
    </Row>
  );
}

export default CustomTracklist;
