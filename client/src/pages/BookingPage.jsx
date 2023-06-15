import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddressLink from "./AddressLink";
import PlaceGallery from "./PlaceGallery";
import { differenceInCalendarDays, format } from "date-fns";

const BookingPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get("bookings").then((response) => {
        const foundBooking = response.data.find(({ _id }) => _id === id);
        if (foundBooking) {
          setBooking(foundBooking);
        }
      });
    }
  }, [id]);

  if (!booking) {
    return "";
  }
  return (
    <div className="my-8">
      <h1 className="text-3xl">{booking.place.title}</h1>
      <AddressLink className="my-2 block">{booking.place.address}</AddressLink>
      <div className="bg-gray-200 p-4 mb-4 rounded-2xl ">
        <h2 className="text-xl">Your booking information</h2>
        <div className="text-xl">
          {differenceInCalendarDays(
            new Date(booking.checkOut),
            new Date(booking.checkIn)
          )}{" "}
          nights | Total price: ${booking.price}
        </div>
      </div>
      <PlaceGallery place={booking.place} />
    </div>
  );
};

export default BookingPage;
