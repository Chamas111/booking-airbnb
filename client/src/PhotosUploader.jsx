import React, { useState } from "react";
import axios from "../src/axiosInstance";

const PhotosUploader = ({ addedPhotos, onChange }) => {
  const [photoLink, setPhotoLink] = useState("");
  const [uploading, setUploading] = useState(false);

  // Upload photo by link
  async function addPhotoByLink(e) {
    e.preventDefault();
    try {
      const { data: url } = await axios.post("/upload-by-link", {
        link: photoLink,
      });

      onChange((prev) => {
        const updated = [...prev, url]; // compute new array
        console.log("Added photos now:", updated); // log here
        return updated; // return the new array to update state
      });
      setPhotoLink("");
    } catch (err) {
      console.error("❌ Upload by link failed:", err);
    }
  }

  // Upload photos from local files
  async function uploadPhoto(e) {
    const files = e.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append("photos", files[i]);
    }

    setUploading(true);
    try {
      const { data: urls } = await axios.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onChange((prev) => {
        const updated = [...prev, ...urls]; // <-- spread here
        console.log("Added photos now:", updated);
        return updated;
      });
    } catch (err) {
      console.error("❌ Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(e, url) {
    e.preventDefault();
    onChange(addedPhotos.filter((photo) => photo !== url));
  }

  function selectMainPhoto(e, url) {
    e.preventDefault();
    onChange([url, ...addedPhotos.filter((p) => p !== url)]);
  }

  return (
    <>
      {/* Add by link */}
      <div className="flex gap-2">
        <input
          type="text"
          value={photoLink}
          onChange={(e) => setPhotoLink(e.target.value)}
          placeholder="Add using a link ...jpg"
        />
        <button
          className="bg-gray-200 px-4 rounded-2xl"
          onClick={addPhotoByLink}
        >
          Add Photo
        </button>
      </div>

      {/* Show uploaded photos */}
      <div className="mt-2 gap-2 grid grid-cols-3 md:grid-cols-4">
        {addedPhotos.length > 0 &&
          addedPhotos.map((url) => (
            <div className="flex h-32 relative" key={url}>
              <img
                className="rounded-2xl w-full object-cover"
                src={url} // ✅ full Cloudinary URL
                alt="Uploaded"
              />

              {/* Remove photo */}
              <button
                onClick={(e) => removePhoto(e, url)}
                className="cursor-pointer absolute bottom-1 right-1 text-white bg-black bg-opacity-50 rounded-2xl py-2 px-3"
              >
                ✖
              </button>

              {/* Select main photo */}
              <button
                onClick={(e) => selectMainPhoto(e, url)}
                className="cursor-pointer absolute bottom-1 left-1 text-white bg-black bg-opacity-50 rounded-2xl py-2 px-3"
              >
                {url === addedPhotos[0] ? "⭐" : "☆"}
              </button>
            </div>
          ))}

        {/* Upload from local files */}
        <label className="flex h-32 items-center gap-1 justify-center border bg-transparent rounded-2xl p-2 text-2xl text-gray-600 cursor-pointer">
          <input
            multiple
            type="file"
            className="hidden"
            onChange={uploadPhoto}
          />
          <span>⬆ Upload</span>
        </label>
      </div>
    </>
  );
};

export default PhotosUploader;
