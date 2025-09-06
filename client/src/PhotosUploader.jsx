import React, { useState } from "react";
import axios from "../axiosInstance"; // ✅ use shared instance

const PhotosUploader = ({ addedPhotos, onChange }) => {
  const [photoLink, setPhotoLink] = useState("");

  // Upload a photo by link
  async function addPhotoByLink(e) {
    e.preventDefault();
    try {
      const { data: filename } = await axios.post("/upload-by-link", {
        link: photoLink,
      });
      onChange((prev) => [...prev, filename]);
      setPhotoLink("");
    } catch (err) {
      console.error("❌ Upload by link failed:", err);
    }
  }

  // Upload photos by file
  async function uploadPhoto(e) {
    const files = e.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append("photos", files[i]); // field name must match multer config
    }

    try {
      const { data: filenames } = await axios.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange((prev) => [...prev, ...filenames]);
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  }

  function removePhoto(e, filename) {
    e.preventDefault();
    onChange(addedPhotos.filter((photo) => photo !== filename));
  }

  function selectMainPhoto(e, filename) {
    e.preventDefault();
    const updatedPhotos = [
      filename,
      ...addedPhotos.filter((p) => p !== filename),
    ];
    onChange(updatedPhotos);
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
          Add&nbsp;Photo
        </button>
      </div>

      {/* Show uploaded photos */}
      <div className="mt-2 gap-2 grid grid-cols-3 md:grid-cols-4">
        {addedPhotos.length > 0 &&
          addedPhotos.map((link) => (
            <div className="flex h-32 relative" key={link}>
              <img
                className="rounded-2xl w-full object-cover"
                src={`${axios.defaults.baseURL}/uploads/${link}`} // ✅ baseURL from instance
                alt="Uploaded"
              />

              {/* Remove photo button */}
              <button
                onClick={(e) => removePhoto(e, link)}
                className="cursor-pointer absolute bottom-1 right-1 text-white bg-black p-1 bg-opacity-50 rounded-2xl py-2 px-3"
              >
                ✖
              </button>

              {/* Select main photo button */}
              <button
                onClick={(e) => selectMainPhoto(e, link)}
                className="cursor-pointer absolute bottom-1 left-1 text-white bg-black p-1 bg-opacity-50 rounded-2xl py-2 px-3"
              >
                {link === addedPhotos[0] ? "⭐" : "☆"}
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
