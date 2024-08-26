import { Link, useNavigate } from "react-router-dom";
import { useData } from "../context/data";

const Navbar = () => {
  const { data, setData } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    setData({ token: null }); // Clear the token
    navigate("/login"); // Redirect to login page
  };
  return (
    <div className="navbar w-full shadow-lg fixed lg:px-12 bg-base-100">
      <div className="flex-1">
        <Link to={"/"} className="btn btn-ghost text-xl">
          HOME
        </Link>
      </div>
      <div className="flex-none">
        <div className="menu gap-4 menu-horizontal px-1">
          {data && data.token ? (
            <>
              <Link
                to={"/profile"}
                className="border py-2 rounded-lg px-4 bg-black text-white"
              >
                Your Profile
              </Link>
              <button
                onClick={handleLogout}
                className="border px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="border py-2 rounded-lg px-4">
                Signup
              </Link>
              <Link
                to="/login"
                className="border py-2 rounded-lg px-4 bg-black text-white"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
