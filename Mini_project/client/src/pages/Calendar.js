import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudySpace.css";

const Calendar = () => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:3001/getWeeklyTasks", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        console.log("Fetched tasks:", res.data.tasks); // Debug log
        setTasks(res.data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  // Build week days dynamically
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Sunday start

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
      active:
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear(),
    };
  });

  // Helper to compare dates by Y/M/D
  const isSameDay = (dateA, dateB) => {
    return (
      dateA.getDate() === dateB.getDate() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getFullYear() === dateB.getFullYear()
    );
  };

  return (
    <div className="calendar-page">
      <h2 className="calendar-title">📅 Weekly Calendar</h2>
      <div className="calendar-grid">
        {days.map((d, index) => {
          const dayDate = new Date(d.year, new Date(d.month + " 1").getMonth(), d.date);

          const dayTasks = tasks.filter((t) => {
            const taskDate = new Date(t.dueDate);
            return isSameDay(taskDate, dayDate);
          });

          return (
            <div
              key={index}
              className={`calendar-day ${d.active ? "active" : ""}`}
            >
              <div className="day-label">{d.day}</div>
              <div className="day-date">{d.date}</div>
              <div className="day-month">{d.month}</div>
              <div className="day-tasks">
                {dayTasks.length > 0 ? (
                  dayTasks.map((task) => (
                    <p key={task._id}>
                      {task.title} ({task.subject})
                    </p>
                  ))
                ) : (
                  <p>No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
