/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import { useData } from "../context/data";


const Homepage = () => {
  const { data } = useData();
  return (
    <div className="flex justify-center items-center">
      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-8xl">
            <h1 className="text-5xl lg:text-6xl font-bold">
               "Welcome to the Task Management System!"
            </h1>
            {data && data.token ? (
              <Link to="/dashboard">
                <button className="py-2 rounded-lg my-6 w-80 bg-black shadow-xl text-white">
                  Go To Tasks
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="py-2 rounded-lg my-6 w-80 bg-black shadow-xl text-white">
                  Login to Continue
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
