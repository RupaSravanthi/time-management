import PropTypes from "prop-types";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    token: "",
  });

  // Load the token from localStorage when the component mounts
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken);
       
        setData({ token: parsedToken });
      } catch (error) {
        console.error("Error parsing stored token", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Update axios default headers and store the token in localStorage
  useEffect(() => {

    if (data.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      localStorage.setItem("token", JSON.stringify(data.token));
    }
  }, [data]);

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the DataContext
const useData = () => useContext(DataContext);

export { useData, DataProvider };
