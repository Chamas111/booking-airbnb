import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AccounNav from "../AccounNav";
import axios from "../axiosInstance";
import PlaceImg from "./PlaceImg";

const PlacesPage = () => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get("/user-places").then(({ data }) => {
      setPlaces(data);
    });
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/user-places/${id}`);
      setPlaces((prev) => prev.filter((place) => place._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete place:", err);
    }
  };

  return (
    <div className="p-4">
      <AccounNav />

      <div className="text-center mt-4">
        <h1 className="text-lg font-semibold">List of all added places</h1>
        <Link
          className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full mt-3"
          to={"/account/places/new"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add new place
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {places.length > 0 &&
          places.map((place) => (
            <Link
              to={"/account/places/" + place._id}
              key={place._id}
              className="flex flex-col md:flex-row items-stretch gap-4 bg-gray-100 p-4 rounded-2xl"
            >
              {/* Image */}
              <div className="w-full md:w-32 h-32 bg-gray-300 rounded-xl overflow-hidden flex-shrink-0">
                <PlaceImg place={place} />
              </div>

              {/* Content & Button */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                <div className="flex-1 text-center md:text-left px-2">
                  <h2 className="text-lg md:text-xl font-semibold">
                    {place.title}
                  </h2>
                  <p className="text-sm mt-2 text-gray-600 line-clamp-3">
                    {place.description}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  className="mt-3 md:mt-0 bg-red-500 text-white px-4 py-2 rounded-full text-sm hover:bg-red-600"
                  onClick={(e) => {
                    e.preventDefault(); // prevent <Link>
                    e.stopPropagation();
                    handleDelete(place._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default PlacesPage;
