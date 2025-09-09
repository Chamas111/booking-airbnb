import React, { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "../src/axiosInstance";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";
const BookingWidget = ({ place }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setnumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [redirect, setRedirect] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  let NumberOfNights = 0;
  if (checkIn && checkOut) {
    NumberOfNights = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );
    console.log(NumberOfNights);
  }

  async function bookThisPlace() {
    const response = await axios.post("/bookings", {
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      mobile,
      place: place._id,
      price: NumberOfNights * place.price,
    });
    const bookingId = response.data._id;
    setRedirect(`/account/bookings/${bookingId}`);
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <>
      <div className="p-4 rounded-2xl bg-white shadow ">
        <div className="text-2xl text-center">
          Price: ${place.price}/ per night
        </div>
        <div className="border  rounded-2xl mt-4">
          <div className="flex">
            <div className=" py-3 px-4 ">
              <label>Check-in: </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className=" py-3 px-4 border-l">
              <label>Check-out: </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
          <div className=" py-3 px-4 border-t">
            <label>Number of Guests: </label>
            <input
              type="number"
              value={numberOfGuests}
              onChange={(e) => setnumberOfGuests(e.target.value)}
            />
          </div>
          {NumberOfNights > 0 && (
            <div className=" py-3 px-4 border-t">
              <label>Your full Name: </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label>Phone number: </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          )}
        </div>

        <button onClick={bookThisPlace} className="primary mt-4">
          {NumberOfNights > 0 && <span>${NumberOfNights * place.price}</span>}{" "}
          Book this place
        </button>
      </div>
    </>
  );
};

export default BookingWidget;
