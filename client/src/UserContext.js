import { createContext, useState, useEffect } from "react";
import axios from "../src/axiosInstance";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!user) {
      const fetchUser = async () => {
        try {
          const response = await axios.get("/profile");
          setUser(response.data);
        } catch (err) {
          console.error("Error fetching user:", err);
        } finally {
          setReady(true);
        }
      };
      fetchUser();
    }
  }, [user]);
  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
