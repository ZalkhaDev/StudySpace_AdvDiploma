import React, { useEffect, useState } from "react";
import api from "../apiClient";
import "./StudySpace.css";

const Analytics = () => {
  const [users, setUsers] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") return;
    (async () => {
      try {
        const res = await api.get("/getAllUsers");
        setUsers(res.data.users);
      } catch (e) {
        console.error("Error fetching users:", e);
      }
    })();
  }, [role]);

  if (role !== "admin") {
    return (
      <div className="analytics-page">
        <h2 className="analytics-title">Access denied — admins only</h2>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user and all their tasks?")) return;
    try {
      await api.delete(`/deleteUser/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch {
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="analytics-page">
      <h2 className="analytics-title">User progress overview</h2>
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Total tasks</th>
            <th>Completed</th>
            <th>Completion %</th>
            <th>Points</th>
            <th>Level</th>
            <th>Next level points</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const total = u.tasks?.length || 0;
            const done = u.tasks?.filter(t => t.status === "done").length || 0;
            const rate = total ? Math.round((done / total) * 100) : 0;
            const points = (u.tasks || []).reduce((sum, t) => {
              if (t.priority === "High") return sum + 20;
              if (t.priority === "Medium") return sum + 10;
              if (t.priority === "Low") return sum + 5;
              return sum;
            }, 0);
            const level = Math.floor(points / 100) + 1;
            const toNext = 100 - (points % 100);

            return (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{total}</td>
                <td>{done}</td>
                <td>{rate}%</td>
                <td>{points}</td>
                <td>Level {level}</td>
                <td>{toNext} pts</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(u._id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Analytics;
