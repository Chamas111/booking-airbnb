import React, { useState, useEffect } from "react";
import AccounNav from "../AccounNav";
import axios from "axios";
const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    axios.get("/bookings").then((response) => {
      setBookings(response.data);
    });
  }, []);

  return (
    <div>
      <AccounNav />
      <div>
        {bookings?.length > 0 &&
          bookings.map((booking) => (
            <div>
              {booking.checkIn} - {booking.checkOut}
            </div>
          ))}
      </div>
    </div>
  );
};

export default BookingsPage;
