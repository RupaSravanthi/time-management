/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import { useData } from "../context/data";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { data, setData } = useData();
  const [tasks, setTasks] = useState([]);


  const [quote, setQuote] = useState("");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await axios.get("http://localhost:3456/users/quotes");
        setQuote(response.data.text);
        console.log(quote)
      } catch (error) {
        console.error("Error fetching quote:", error);
      }
    };

    fetchQuote();
  }, []);


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "low",
    due_date: "",
    time_limit: "00:00:00"
  });
  const [taskToDelete, setTaskToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!data.token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:3456/users/tasks", {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        setTasks(sortTasks(response.data.tasks));
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle the error or redirect if needed
      }
    };

    fetchTasks();
  }, [data.token, navigate]);

  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      if (a.status === b.status) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return a.status === "pending" ? -1 : 1;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3456/users/tasks", formData, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      const response = await axios.get("http://localhost:3456/users/tasks", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      setTasks(sortTasks(response.data.tasks));
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "low",
        due_date: "",
        time_limit: "00:00:00"
      });
      document.getElementById("my_modal_1").close();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3456/users/tasks/${taskToDelete}`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      document.getElementById("delete_modal").close();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const openDeleteModal = (taskId) => {
    setTaskToDelete(taskId);
    document.getElementById("delete_modal").showModal();
  };

  const handleMarkAsFinished = async (taskId) => {
    try {
      await axios.put(`http://localhost:3456/users/tasks/${taskId}`, { status: "completed" }, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      setTasks(tasks.map(task => task.id === taskId ? { ...task, status: "completed" } : task));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (!data.token) {
    return null; // Avoid rendering the component if there's no token
  }

  return (
    <div className="pt-20 max-w-7xl mx-auto">
      <h1 className="text-5xl lg:text-6xl font-bold">
              {quote || "Welcome to the Task Management System!"}
            </h1>
      <div className="flex items-center p-4 justify-between w-full">
        <h1 className="text-4xl py-4 font-semibold">Your Tasks</h1>
        <button
          onClick={() => document.getElementById("my_modal_1").showModal()}
          className="bg-black text-white h-10 px-4 rounded-lg shadow-xl"
        >
          Create New Task
        </button>
        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create New Task</h3>
            <form onSubmit={handleSubmit} className="py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Time Limit</label>
                <input
                  type="time"
                  name="time_limit"
                  value={formData.time_limit}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Submit</button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => document.getElementById("my_modal_1").close()}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`h-full p-4 rounded-lg shadow-md ${task.status === "completed" ? "bg-gray-300" : "bg-gray-100"}`}
          >
            <h2 className="text-2xl font-semibold mb-2">{task.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            <p className="text-sm">
              <strong>Status:</strong> {task.status}
            </p>
            <p className="text-sm">
              <strong>Priority:</strong> {task.priority}
            </p>
            <p className="text-sm">
              <strong>Due Date:</strong>{" "}
              {new Date(task.due_date).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              Created: {new Date(task.created_at).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Updated: {new Date(task.updated_at).toLocaleString()}
            </p>

            <div className="flex justify-between gap-4 pt-4">
              <button
                onClick={() => handleMarkAsFinished(task.id)}
                className="text-white px-4 w-full text-center bg-green-500 rounded-md py-2"
                disabled={task.status === "completed"}
              >
                {task.status === "completed" ? "Finished" : "Mark as Finished"}
              </button>
              <button
                onClick={() => openDeleteModal(task.id)}
                className="text-white px-4 w-full text-center bg-red-500 rounded-md py-2"
              >
                Delete Task
              </button>
            </div>
          </div>
        ))}
      </div>

      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Deletion</h3>
          <p className="py-4">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="modal-action">
            <button
              onClick={handleDelete}
              className="btn text-white btn-error"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => document.getElementById("delete_modal").close()}
              className="btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Dashboard;
