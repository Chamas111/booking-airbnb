function PlaceImg({ place, index = 0, className = "object-cover grow" }) {
  if (!place.photos?.length) return null;

  return (
    <img
      className={className}
      src={place.photos[index]} // use the full URL directly
      alt={place.title}
    />
  );
}

export default PlaceImg;
