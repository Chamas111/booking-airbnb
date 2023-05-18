import "./App.css";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import IndexPages from "./pages/IndexPages";
import LoginPage from "./pages/LoginPage";
import Layout from "./Layout";
import RegisterPage from "./pages/RegisterPage";
import { UserContextProvider } from "./UserContext";
import Account from "./pages/Account";
function App() {
  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.withCredentials = true;
  return (
    <>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPages />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/account/:subpage?" element={<Account />} />
          </Route>
        </Routes>
      </UserContextProvider>
    </>
  );
}

export default App;
