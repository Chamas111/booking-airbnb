import React, { useEffect, useState } from "react";
import Perks from "../Perks";
import axios from "axios";
import PhotosUploader from "../PhotosUploader";
import AccounNav from "../AccounNav";
import { Navigate, useParams, useNavigate } from "react-router-dom";

const PlacesFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [redirect, setRedirect] = useState(false);
  const [price, setPrice] = useState(100);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get("/places/" + id).then((response) => {
      const { data } = response;
      setTitle(data.title);
      setAddress(data.address);
      setAddedPhotos(data.photos);
      setDescription(data.description);
      setPerks(data.perks);
      setExtraInfo(data.extraInfo);
      setCheckIn(data.checkIn);
      setCheckOut(data.checkOut);
      setMaxGuests(data.maxGuests);
      setPrice(data.price);
    });
  }, [id]);

  async function savePlace(e) {
    e.preventDefault();
    try {
      const placeData = {
        title,
        address,
        addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      };
      if (id) {
        console.log(id);
        await axios.put("places", {
          id,
          ...placeData,
        });
        setRedirect(true);
      } else {
        await axios
          .post("places", placeData)
          .then((res) => navigate("/account/places"));
        console.log(placeData);
        setRedirect(true);
      }
    } catch (err) {
      console.log(err);
    }
  }
  if (redirect) {
    return <Navigate to={"/account/places"} />;
  }

  return (
    <>
      <div>
        <AccounNav />
        <form onSubmit={savePlace}>
          <h2 className="text-2xl mt-4">Title</h2>
          <p className="text-gray-500 text-sm">
            Title for your place. Should be short and catchy as in advertisment
          </p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="title for example: My lovely App"
          />
          <h2 className="text-2xl mt-4">Address</h2>
          <p className="text-gray-500 text-sm">Address to this place</p>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
          />
          <h2 className="text-2xl mt-4">Photos</h2>
          <p className="text-gray-500 text-sm">more = better</p>
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

          <h2 className="text-2xl mt-4">Description</h2>
          <p className="text-gray-500 text-sm">Description of the place</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <h2 className="text-2xl mt-4">Perks</h2>
          <p className="text-gray-500 text-sm">
            Select all the perks of the place
          </p>
          <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <Perks selected={perks} onChange={setPerks} />
          </div>

          <h2 className="text-2xl mt-4">Extra info</h2>
          <p className="text-gray-500 text-sm">House rules, etc</p>
          <textarea
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
          />

          <h2 className="text-2xl mt-4">Check in & out times, max guests</h2>
          <p className="text-gray-500 text-sm">
            Add check in and out times, remeber to have some time window for
            cleaning the room between geusts.
          </p>
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="mt-2 -mb-1">Check in Time</h3>
              <input
                type="text"
                placeholder="14"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div>
              <h3 className="mt-2 -mb-1">Check out Time</h3>
              <input
                type="text"
                placeholder="11"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <div>
              <h3 className="mt-2 -mb-1">Max number of guests</h3>
              <input
                type="number"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
              />
            </div>
            <div>
              <h3 className="mt-2 -mb-1">Price per night</h3>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <button className="primary my-4">Save</button>
        </form>
      </div>
    </>
  );
};

export default PlacesFormPage;
