import React, { useState, useEffect } from "react";
import AccounNav from "../AccounNav";
import axios from "../axiosInstance";
import { differenceInCalendarDays, format } from "date-fns";
import { Link } from "react-router-dom";
import PlaceImg from "./PlaceImg";

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
      <div className="mt-4 flex flex-col gap-4">
        {bookings?.length > 0 &&
          bookings.map((booking) => (
            <Link
              key={booking._id}
              to={`/account/bookings/${booking._id}`}
              className="flex flex-col md:flex-row gap-4 bg-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                <PlaceImg
                  place={booking.place}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="py-3 px-4 flex flex-col justify-between grow">
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  {booking.place.title}
                </h2>

                {/* Dates */}
                <div className="flex flex-wrap gap-2 items-center border-t border-gray-300 pt-2 text-sm md:text-base">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75"
                      />
                    </svg>
                    {format(new Date(booking.checkIn), "yyyy-MM-dd")}
                  </div>

                  <span className="text-gray-600">→</span>

                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25"
                      />
                    </svg>
                    {format(new Date(booking.checkOut), "yyyy-MM-dd")}
                  </div>
                </div>

                {/* Price */}
                <div className="mt-2 text-sm md:text-lg font-medium">
                  {differenceInCalendarDays(
                    new Date(booking.checkOut),
                    new Date(booking.checkIn)
                  )}{" "}
                  nights |{" "}
                  <span className="font-bold">Total: ${booking.price}</span>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default BookingsPage;
