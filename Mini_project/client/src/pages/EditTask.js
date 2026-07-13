import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../apiClient";   // ✅ use the axios instance with interceptor
import "./StudySpace.css";

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    priority: "Medium",
    dueDate: "",
    estimatedTime: "",
    notes: ""
  });

  // Load existing task
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get("/getAllTasks"); // ✅ token attached
        const task = res.data.tasks.find((t) => t._id === id);
        if (task) {
          setFormData({
            subject: task.subject,
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate.slice(0, 10),
            estimatedTime: task.estimatedTime,
            notes: task.notes
          });
        }
      } catch (error) {
        console.error("Error loading task:", error);
      }
    };
    fetchTask();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/updateTask/${id}`, formData); // ✅ token attached
      alert("Task updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task.");
    }
  };

  return (
    <div className="new-task-page">
      <h2>Edit Task</h2>
      <form onSubmit={handleSubmit}>
        <div> 
        <input
          type="text"
          name="subject"
          placeholder="Subject (e.g., Mathematics)"
          className="form-control"
          value={formData.subject}
          onChange={handleChange}
        />
<br></br>
        <input
          type="text"
          name="title"
          placeholder="Task Title (e.g., Chapter 5 exercises)"
          className="form-control"
          value={formData.title}
          onChange={handleChange}
        />
<br></br>
        <select
          name="priority"
          className="form-select"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
<br></br>
        <input
          type="date"
          name="dueDate"
          className="form-control"
          value={formData.dueDate}
          onChange={handleChange}
        />
<br></br>
        <input
          type="text"
          name="estimatedTime"
          placeholder="Estimated Time (e.g., 2 hours)"
          className="form-control"
          value={formData.estimatedTime}
          onChange={handleChange}
        />
<br></br>
        <textarea
          name="notes"
          placeholder="Notes (Optional)"
          className="form-control"
          value={formData.notes}
          onChange={handleChange}
        /></div>
<br></br>
        <div className="form-buttons">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
            Cancel
          </button>
          <button type="submit" className="submit">
            Update Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTask;
