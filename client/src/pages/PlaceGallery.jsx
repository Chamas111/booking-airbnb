import { useState } from "react";

function PlaceGallery({ place }) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  if (showAllPhotos) {
    return (
      <div className="absolute inset-0 bg-black text-white min-h-screen">
        <div className="bg-black p-8 grid gap-4">
          <div>
            <h2 className="text-3xl mr-36">Photos of {place.title}</h2>
            <button
              onClick={() => setShowAllPhotos(false)}
              className="fixed right-12 top-8 flex gap-2 py-2 px-4 rounded-2xl shadow shadow-black bg-white text-black"
            >
              Close photos
            </button>
          </div>
          {place.photos?.length > 0 &&
            place.photos.map((photo) => (
              <div key={photo}>
                <img src={photo} alt={place.title} />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid gap-2 grid-cols-[2fr_1fr] rounded-3xl overflow-hidden">
        <div>
          {place.photos?.[0] && (
            <img
              onClick={() => setShowAllPhotos(true)}
              className="aspect-square object-cover cursor-pointer"
              src={place.photos[0]}
              alt={place.title}
            />
          )}
        </div>
        <div className="grid">
          {place.photos?.[1] && (
            <img
              onClick={() => setShowAllPhotos(true)}
              className="aspect-square object-cover cursor-pointer"
              src={place.photos[1]}
              alt={place.title}
            />
          )}
          <div className="overflow-hidden">
            {place.photos?.[2] && (
              <img
                onClick={() => setShowAllPhotos(true)}
                className="aspect-square object-cover relative top-2 cursor-pointer"
                src={place.photos[2]}
                alt={place.title}
              />
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowAllPhotos(true)}
        className="
    flex gap-1 py-2 px-4 bg-white rounded-2xl shadow shadow-md shadow-gray-500
    md:absolute md:bottom-2 md:right-2  
    mx-auto mt-2 md:mt-0                
  "
      >
        Show more photos
      </button>
    </div>
  );
}

export default PlaceGallery;
