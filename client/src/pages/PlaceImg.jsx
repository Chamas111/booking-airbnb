import React from "react";

function PlaceImg({ place, index = 0, className = null }) {
  if (!place.photos?.length) {
    return "";
  }
  if (!className) {
    className = "object-cover grow";
  }
  return (
    <img
      className={className}
      src={`${process.env.REACT_APP_SERVER_BASE_URL}/uploads/${place.photos[index]}`}
      alt={place.title}
    />
  );
}

export default PlaceImg;
