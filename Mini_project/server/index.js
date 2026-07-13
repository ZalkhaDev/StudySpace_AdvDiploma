import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection string
const constr = "mongodb+srv://admin:csse3101@cluster0.xktwb6p.mongodb.net/studentdb?appName=Cluster0";
mongoose.connect(constr);

// ================== Schemas ==================

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "user" } // "user" or "admin"
});
const UserModel = mongoose.model("User", userSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: String,
  title: String,
  priority: String,
  dueDate: Date,
  estimatedTime: String,
  notes: String,
  status: { type: String, default: "pending" }
});
const TaskModel = mongoose.model("Task", taskSchema);

// ================== Middleware ==================

const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).send({ msg: "No token" });
  try {
    const payload = jwt.verify(token, "SECRET_KEY");
    req.user = payload; // { id, role }
    next();
  } catch {
    return res.status(401).send({ msg: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).send({ msg: "Admins only" });
  next();
};

// ================== Auth Routes ==================

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).send({ msg: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, password: hashed });
    await user.save();
    res.status(200).send({ msg: "User registered successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Registration failed." });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).send({ msg: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send({ msg: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY", { expiresIn: "7d" });
  res.status(200).send({ msg: "Login successful!", token, role: user.role });
});

// ================== Task Routes ==================

// Add Task (userId attached from token)
app.post("/addTask", auth, async (req, res) => {
  try {
    const { subject, title, priority, dueDate, estimatedTime, notes } = req.body;
    const task = new TaskModel({
      userId: req.user.id,
      subject, title, priority, dueDate, estimatedTime, notes
    });
    await task.save();
    res.send({ task, msg: "Task document saved successfully" });
  } catch (error) {
    res.status(500).send({ msg: "An ERROR Occurred" });
  }
});

// Get tasks (user sees own, admin sees all)
app.get("/getAllTasks", auth, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const tasks = await TaskModel.find(query)
      .populate("userId", "name email"); // ✅ populate user info
    res.send({ tasks });
  } catch (error) {
    res.status(500).send({ msg: "Unexpected error occurred" });
  }
});

// Get tasks for the current week (user sees own, admin sees all)
app.get("/getWeeklyTasks", auth, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };

    // Calculate start and end of current week (Sunday → Saturday)
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7); // next Sunday
    weekEnd.setHours(23, 59, 59, 999);

    // Add date filter
    query.dueDate = { $gte: weekStart, $lt: weekEnd };

    const tasks = await TaskModel.find(query).populate("userId", "name email");
    res.send({ tasks });
  } catch (error) {
    console.error("Error fetching weekly tasks:", error);
    res.status(500).send({ msg: "Unexpected error occurred" });
  }
});


// Delete Task
app.delete("/deleteTask/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await TaskModel.findByIdAndDelete(id);
    if (deleted) res.status(200).send({ msg: "Task deleted successfully!" });
    else res.status(404).send({ msg: "Task not found" });
  } catch (error) {
    res.status(500).send({ msg: "Unexpected error occurred" });
  }
});

// Update Task
app.put("/updateTask/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedTask = await TaskModel.findByIdAndUpdate(id, req.body, { new: true });
    if (updatedTask) res.status(200).send({ msg: "Task updated successfully!", task: updatedTask });
    else res.status(404).send({ msg: "Task not found" });
  } catch (error) {
    res.status(500).send({ msg: "Unexpected error occurred" });
  }
});

// Mark Task Done
app.put("/markDone/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedTask = await TaskModel.findByIdAndUpdate(id, { status: "done" }, { new: true });
    if (updatedTask) res.status(200).send({ msg: "Task marked as done!", task: updatedTask });
    else res.status(404).send({ msg: "Task not found" });
  } catch (error) {
    res.status(500).send({ msg: "Unexpected error occurred" });
  }
});

// ================== Admin Routes ==================

// Get all users with their tasks
app.get("/getAllUsers", auth, adminOnly, async (req, res) => {
  try {
    const users = await UserModel.find().lean();
    const tasks = await TaskModel.find().lean();
    const usersWithTasks = users.map(u => ({
      ...u,
      tasks: tasks.filter(t => t.userId?.toString() === u._id.toString())
    }));
    res.status(200).send({ users: usersWithTasks });
  } catch (error) {
    res.status(500).send({ msg: "Failed to fetch users" });
  }
});

// Delete user (and their tasks)
app.delete("/deleteUser/:id", auth, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    await UserModel.findByIdAndDelete(id);
    await TaskModel.deleteMany({ userId: id });
    res.status(200).send({ msg: "User deleted successfully!" });
  } catch (error) {
    res.status(500).send({ msg: "Failed to delete user" });
  }
});

// ================== Server ==================
app.listen(3001, () => {
  console.log("Server is connected on port 3001...");
});
