import React from "react";
import { Row, Col } from "react-bootstrap";
import DiscIcon from "../Assets/Icons/discicon.png";
import { Link } from 'react-router-dom';

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${minutes}:${formattedSeconds}`;
}

const linkStyles = {
  textDecoration: 'none', // Remove underline
  color: 'inherit', // Inherit the color from the parent
};


function CustomTracklist({
  items,
  showTracklistTop = true,
  alternate = false,
  showDiscNumber = false, // New prop to control rendering of disc number
}) {
  // Grouping tracks by disc number
  const discs = {};
  items.forEach((item) => {
    const discNumber = item.disc_number || 1; // Default disc number is 1
    if (!discs[discNumber]) {
      discs[discNumber] = [];
    }
    discs[discNumber].push(item);
  });

  const discNumbers = Object.keys(discs);

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
              <span className="album-name"> {alternate !== true ? 'Album' : ''}</span>
              <span className="track-number">Duration</span>
            </div>
          )}
          <hr className="separator" />
          {/* Display tracks for each disc */}
          {discNumbers.map((discNumber) => (
            <div key={`disc-${discNumber}`}>
              {showDiscNumber && discNumbers.length > 1 && ( // Check if there's more than one disc and if showDiscNumber is true
                <div className="disc-number">
                  <img className="disc-icon" src={DiscIcon} />
                  <span className="disc-info">Disc {discNumber}</span>
                </div>
              )}

              {alternate === true ? (
                discs[discNumber].map((item, index) => (
                  <Col key={item.id} xs={12}>
                    {/* Render tracklist without album covers */}
                    <div className="tracklist-item">
                      <span className="track-number">{index + 1}</span>
                      <div className="name-artist">
                        <span className="song-name">{item.name}</span>
                        <span className="artist-name">
                          {item.artists.map((artist, index) => (
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
                      
                      </span>
                      <span className="song-length">
                        {formatDuration(item.duration_ms)}
                      </span>
                    </div>
                  </Col>
                ))
              ) : (
                discs[discNumber].map((item, index) => (
                  <Col key={item.id} xs={12}>
                    {/* Render tracklist with album covers */}
                    <div className="tracklist-item">
                      <span className="track-number">{index + 1}</span>
                      <div className="album-cover">
                        <img src={item.album.images[0].url} alt={item.name} />
                      </div>
                      <div className="name-artist">
                        <span className="song-name">{item.name}</span>
                        <span className="artist-name">
                          {item.artists.map((artist, index) => (
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
                        <Link to={`/album/${item.album.id}`} style={linkStyles}>
                            {item.album.name}
                        </Link>
                      </span>
                      <span className="song-length">
                        {formatDuration(item.duration_ms)}
                      </span>
                    </div>
                  </Col>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </Row>
  );
}

export default CustomTracklist;
