import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../apiClient";
import "./StudySpace.css";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState(null);

  useEffect(() => {
    // restore role from localStorage
    const savedRole = localStorage.getItem("role");
    setRole(savedRole);

    const fetchTasks = async () => {
      try {
        const res = await api.get("/getAllTasks");
        setTasks(res.data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pending = tasks.filter((t) => t.status !== "done").length;
  const points = tasks.reduce((sum, t) => {
    if (t.priority === "High") return sum + 20;
    if (t.priority === "Medium") return sum + 10;
    if (t.priority === "Low") return sum + 5;
    return sum;
  }, 0);

  let level = Math.floor((points - 1) / 100) + 1;
  if (level < 1) level = 1;

  // ✅ include username in search if admin
  const filteredTasks = tasks.filter((task) => {
    const term = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      task.subject.toLowerCase().includes(term) ||
      task.notes.toLowerCase().includes(term) ||
      (role === "admin" && task.userId?.name?.toLowerCase().includes(term))
    );
  });

  const deleteTask = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/deleteTask/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
      alert("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task.");
    }
  };

  const markTaskDone = async (id) => {
    try {
      const res = await api.put(`/markDone/${id}`);
      setTasks(tasks.map((task) => (task._id === id ? res.data.task : task)));
      alert("✅ Task marked as done successfully!");
    } catch (error) {
      console.error("Error marking task as done:", error);
      alert("Failed to mark task.");
    }
  };

  return (
    <div className="dashboard">
      {/* Level Progress */}
      <section className="progress-section">
        <h3>Level {level} Progress</h3>
        <p className="subtext">100 points to next level</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${points % 100}%` }}></div>
        </div>
        <div className="progress-percent">{points % 100}%</div>
      </section>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card"><p>Total</p><h2>{total}</h2></div>
        <div className="stat-card"><p>Done ✅</p><h2>{done}</h2></div>
        <div className="stat-card"><p>Pending ⏳</p><h2>{pending}</h2></div>
        <div className="stat-card"><p>Level 🏆</p><h2>{level}</h2></div>
        <div className="stat-card"><p>Points ⭐</p><h2>{points}</h2></div>
      </section>

      {/* Task Search */}
      <section className="task-search">
        <input
          type="text"
          placeholder={role === "admin" ? "Search tasks or users..." : "Search tasks..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="filter-button">🔍</button>
      </section>

      {/* Task List */}
      <section className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <h3>No tasks found</h3>
            <p>Start adding tasks to organize your study!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="task-entry">
              <div className="task-top">
                <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                <span className="subject-tag">
                  {task.subject}
                  {/* ✅ show username next to subject if admin */}
                  {role === "admin" && task.userId?.name && (
                    <span className="user-inline"> — {task.userId.name}</span>
                  )}
                </span>
              </div>
              <h4 className="task-title">{task.title}</h4>
              <p className="task-date">
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="task-notes">{task.notes}</p>
              <div className="task-icons">
                {task.status === "done" ? (
                  <>
                    <span className="locked">✔️ Done</span>
                    <button onClick={() => deleteTask(task._id)} className="icon delete">🗑️</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => markTaskDone(task._id)} className="icon done">✅</button>
                    <Link to={`/edit/${task._id}`} className="icon edit">✏️</Link>
                    <button onClick={() => deleteTask(task._id)} className="icon delete">🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Upcoming Deadlines */}
      <section className="deadlines">
        <h3>📅 Upcoming Deadlines</h3>
        {tasks.filter(task =>
          new Date(task.dueDate) >= new Date() && task.status !== "done"
        ).length === 0 ? (
          <p>No upcoming deadlines</p>
        ) : (
          tasks
            .filter(task =>
              new Date(task.dueDate) >= new Date() && task.status !== "done"
            )
            .map((task, index) => (
              <p key={index}>
                {task.title} ({task.subject}) -{" "}
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                {role === "admin" && task.userId?.name && ` — by ${task.userId.name}`}
              </p>
            ))
        )}
      </section>

      {/* Motivation */}
      <section className="motivation">
        <h3>⭐ Motivation</h3>
        <p>Ready to begin? <span className="highlight">Let's find your first task...</span> ✏️</p>
      </section>
    </div>
  );
};

export default Dashboard;
