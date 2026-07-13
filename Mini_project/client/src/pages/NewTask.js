import { useState } from "react";
import api from "../apiClient";   // ✅ use the axios instance with interceptor
import "./StudySpace.css";

function NewTask() {
  // state variables for each field
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [response, setResponse] = useState("");

  // function to add task
  const addTask = async () => {
    try {
      const res = await api.post("/addTask", {
        subject,
        title,
        priority,
        dueDate,
        estimatedTime,
        notes,
      });
      setResponse(res.data.msg);
      console.log(res.data.task);
    } catch (error) {
      setResponse("Error adding task");
      console.error(error);
    }
  };

  return (
    <div className="new-task-page">
      <h2>Add New Task</h2>

      <input
        type="text"
        placeholder="Subject (e.g., Mathematics)"
        className="form-control"
        onChange={(event) => setSubject(event.target.value)}
      />

      <input
        type="text"
        placeholder="Task Title (e.g., Chapter 5 exercises)"
        className="form-control"
        onChange={(event) => setTitle(event.target.value)}
      />

      <select
        className="form-select"
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <input
        type="date"
        className="form-control"
        onChange={(event) => setDueDate(event.target.value)}
      />

      <input
        type="text"
        placeholder="Estimated Time (e.g., 2 hours)"
        className="form-control"
        onChange={(event) => setEstimatedTime(event.target.value)}
      />

      <textarea
        placeholder="Notes (Optional)"
        className="form-control"
        onChange={(event) => setNotes(event.target.value)}
      ></textarea>

      <div className="form-buttons">
        <button className="btn btn-secondary">Cancel</button>
        <button className="submit" onClick={addTask}>
          Add Task
        </button>
      </div>

      <p className="success-msg">{response}</p>
    </div>
  );
}

export default NewTask;
