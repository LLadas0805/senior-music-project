import React from "react";
import { Row, Col } from "react-bootstrap";
import { Link } from 'react-router-dom';


function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${minutes}:${formattedSeconds}`;
}

function PlaylistTracklist({
  items,
  showTracklistTop = true,
  alternate = false,
}) {
  

  const linkStyles = {
    textDecoration: 'none', // Remove underline
    color: 'inherit', // Inherit the color from the parent
  };

  

  return (
    <Row className="">
      {items.length === 0 ? (
        <p>No items to display</p>
      ) : (
        <div>
          {showTracklistTop && (
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
          )}
          <hr className="separator" />
          <div>
            {alternate === true ? (
              items.map((item, index) => (
                <Col key={item.id} xs={12}>
                  {/* Render tracklist without album covers */}
                  <div className="tracklist-item">
                    <span className="track-number">{index + 1}</span>
                    <div className="name-artist">
                      <span className="song-name">{item.track.name}</span>
                      <span className="artist-name">
                        {item.artists.map((artist) => artist.name).join(", ")}
                      </span>
                    </div>
                    <span className="song-length">
                      {formatDuration(item.track.duration_ms)}
                    </span>
                  </div>
                </Col>
              ))
            ) : (
              items.map((item, index) => (
                <Col key={item.id} xs={12}>
                  {/* Render tracklist with album covers */}
                  <div className="tracklist-item">
                    <span className="track-number">{index + 1}</span>
                    <div className="album-cover">
                      <img src={item.track.album.images[0].url} alt={item.track.name} />
                    </div>
                    <div className="name-artist">
                      <span className="song-name">{item.track.name}</span>
                      <span className="artist-name">
                        {item.track.artists.map((artist, index) => (
                          <React.Fragment key={index}>
                            {index !== 0 && ", "} {/* Add comma after the first artist */}
                            <Link to={`/artist/${artist.id}`} style={linkStyles}>
                              {artist.name}
                            </Link>
                          </React.Fragment>
                        ))}
                      </span>
                    </div>
                    <span className="album-name">
                      <Link to={`/album/${item.track.album.id}`} style={linkStyles}>
                            {item.track.album.name}
                      </Link>
                    </span>
                    <span className="song-length">
                      {formatDuration(item.track.duration_ms)}
                    </span>
                  </div>
                </Col>
              ))
            )}
          </div>
        </div>
      )}
    </Row>
  );
}



export default PlaylistTracklist;
