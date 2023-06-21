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
      src={`/uploads/${place.photos[index]}`}
      alt={place.title}
    />
  );
}

export default PlaceImg;
