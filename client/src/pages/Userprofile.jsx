import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/data";

const Userprofile = () => {
  const { data } = useData();
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!data || !data.token) {
      // If there's no token, redirect to the login page
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:3456/users/user-profile", {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [data, navigate]);

  const handleUpdateProfile = async () => {
    try {
      const payload = {
        ...user,
        currentPassword,
        newPassword,
      };

      await axios.put("http://localhost:3456/users/update-profile", payload, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg pt-20">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Age</label>
        <input
          type="number"
          value={user.age}
          onChange={(e) => setUser({ ...user, age: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Profession</label>
        <input
          type="text"
          value={user.profession}
          onChange={(e) => setUser({ ...user, profession: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Contact Number</label>
        <input
          type="text"
          value={user.contact_number}
          onChange={(e) => setUser({ ...user, contact_number: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <button
        onClick={handleUpdateProfile}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg"
      >
        Update Profile
      </button>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default Userprofile;
