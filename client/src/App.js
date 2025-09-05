import "./App.css";
import axios from "../src/axiosInstance";
import { Routes, Route } from "react-router-dom";
import IndexPages from "./pages/IndexPages";
import LoginPage from "./pages/LoginPage";
import Layout from "./Layout";
import RegisterPage from "./pages/RegisterPage";
import { UserContextProvider } from "./UserContext";
import Account from "./pages/Account";
import PlacesPage from "./pages/PlacesPage";
import PlacesFormPage from "./pages/PlacesFormPage";
import PlaceDetails from "./pages/PlaceDetails";
import BookingsPage from "./pages/BookingsPage";
import BookingPage from "./pages/BookingPage";
function App() {
  axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;
  axios.defaults.withCredentials = true;
  return (
    <>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPages />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/account" element={<Account />} />
            <Route path="/account/places" element={<PlacesPage />} />
            <Route path="/account/places/new" element={<PlacesFormPage />} />

            <Route path="/account/places/:id" element={<PlacesFormPage />} />
            <Route path="/place/:id" element={<PlaceDetails />} />
            <Route path="/account/bookings" element={<BookingsPage />} />
            <Route path="/account/bookings/:id" element={<BookingPage />} />
          </Route>
        </Routes>
      </UserContextProvider>
    </>
  );
}

export default App;
