import React from "react";





const SearchTypeButtons = ({ searchType, setSearchType, types }) => {
  
  return (
    <div className="search-type-buttons-container">
      <div className="search-type-buttons">
        {types.map((type) => (
          <button
            key={type.value}
            className={`search-type-button ${searchType === type.value ? "active" : ""}`}
            onClick={() => setSearchType(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchTypeButtons;