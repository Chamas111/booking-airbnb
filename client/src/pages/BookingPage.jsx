import React from "react";
import { useParams } from "react-router-dom";
const BookingPage = () => {
  const { id } = useParams();
  return <div>sing: {id}</div>;
};

export default BookingPage;
