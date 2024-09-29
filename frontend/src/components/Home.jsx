import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    const fetchtodos = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:4001/todo/fetch", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        setTodos(response.data.todos);
        setError(null);
      } catch (error) {
        setError("Failed to fetch todos");
      } finally {
        setLoading(false);
      }
    };
    fetchtodos();
  }, []);

  const todoCreate = async () => {
    if (!newTodo) return;
    try {
      const response = await axios.post(
        "http://localhost:4001/todo/create",
        {
          text: newTodo,
          completed: false,
        },
        {
          withCredentials: true,
        }
      );
      setTodos([...todos, response.data.newTodo]);
      setNewTodo("");
    } catch (error) {
      setError("Failed to create todo");
    }
  };

  const todoStatus = async (id) => {
    const todo = todos.find((t) => t._id === id);
    try {
      const response = await axios.put(
        `http://localhost:4001/todo/update/${id}`,
        {
          ...todo,
          completed: !todo.completed,
        },
        {
          withCredentials: true,
        }
      );
      setTodos(todos.map((t) => (t._id === id ? response.data.todo : t)));
    } catch (error) {
      setError("Failed to update todo");
    }
  };

  const todoDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4001/todo/delete/${id}`, {
        withCredentials: true,
      });
      setTodos(todos.filter((t) => t._id !== id));
    } catch (error) {
      setError("Failed to Delete Todo");
    }
  };

  const navigateTo = useNavigate();
  const logout = async () => {
    try {
      await axios.get("http://localhost:4001/user/logout", {
        withCredentials: true,
      });
      toast.success("User logged out successfully");
      navigateTo("/login");
      localStorage.removeItem("jwt");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const remainingTodos = todos.filter((todo) => !todo.completed).length;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="my-10 bg-white shadow-xl rounded-lg backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100 w-full max-w-md p-6">
        <h1 className="text-3xl font-semibold text-center mb-6 text-blue-600">
          Daily Task
        </h1>
        <div className="flex mb-6">
          <input
            type="text"
            placeholder="Add a new task"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && todoCreate()}
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={todoCreate}
            className="bg-blue-600 text-white rounded-r-lg px-4 py-2 hover:bg-blue-800 duration-300"
          >
            Add
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            <span className="text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 font-semibold">{error}</div>
        ) : (
          // Adding a max height and scroll behavior to the task list
          <ul className="space-y-4 max-h-96 overflow-y-auto overflow-x-hidden">
            {todos.map((todo, index) => (
              <li
                key={todo._id || index}
                className="flex items-center justify-between p-4 text-black font-1xl backdrop-filter backdrop-blur-sm bg-opacity-90 border border-gray-100 rounded-md shadow"
              >
                <div className="flex items-center w-full">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => todoStatus(todo._id)}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  {/* Text wrapping to avoid layout issues */}
                  <span
                    className={`flex-grow break-words ${
                      todo.completed
                        ? "line-through text-gray-600"
                        : "text-gray-800"
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
                <button
                  onClick={() => todoDelete(todo._id)}
                  className="text-red-500 hover:text-red-700 duration-300 ml-3"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-center text-sm text-black">
          {remainingTodos} remaining Tasks
        </p>
        <button
          onClick={() => logout()}
          className="mt-6 block w-full text-center py-3 bg-red-500 text-white rounded-md hover:bg-red-700 duration-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;
