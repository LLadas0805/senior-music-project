// Import modules
import React from "react";

// This component allows us to filter search results based on given search types fed into it
const SearchTypeButtons = ({ searchType, setSearchType, types }) => {
  
  // Rendering search type buttons based on the provided types array
  return (
    <div className="search-type-buttons-container">
      <div className="search-type-buttons">
        {/* Mapping through the types array to generate buttons */}
        {types.map((type) => (
          <button
            key={type.value} 
            className={`search-type-button ${searchType === type.value ? "active" : ""}`} // Applying 'active' class based on the selected search type
            onClick={() => setSearchType(type.value)} // Setting the search type on button click
          >
            {type.label} 
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchTypeButtons; 
