const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");

const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");
const moment = require("moment");

mongoose
  .connect("mongodb+srv://gakurujonas633:todolist123@cluster0.eozaphy.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connectin to mongoDb", error);
  });

app.listen(port, () => {
  console.log("Server is running on port 3000");
});

const User = require("./models/user");
const Todo = require("./models/todo");

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    ///check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered");
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    res.status(202).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error registering the user", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");

  return secretKey;
};

const secretKey = generateSecretKey();

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalide password" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Login failed", error);
    res.status(500).json({ message: "Login failed" });
  }
});


app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.get("/users/:userId/todos", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate("todos");
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.status(200).json({ todos: user.todos });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/getAll/Todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/PostTodos/Todos", async (req, res) => {
  try {
    const { title } = req.body;
    const newTodo = new Todo({ title });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get("/getPending/Todos", async (req, res) => {
  try {
    const pendingTodos = await Todo.find({ status: "pending" });
    res.json(pendingTodos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/getCompleted/Todos", async (req, res) => {
  try {
    const completedTodos = await Todo.find({ status: "completed" });
    res.json(completedTodos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete("/delete/Todos/:id", async (req, res) => {
  try {
    const todoId = req.params.id;

    // Check if the To-Do ID exists in the database
    const existingTodo = await Todo.findById(todoId);
    if (!existingTodo) {
      return res.status(404).json({ error: "To-Do not found" });
    }

    // Delete the To-Do
    await Todo.findByIdAndDelete(todoId);

    res.json({ message: "To-Do deleted successfully" });
  } catch (error) {
    console.error("Error deleting To-Do:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.put("/update/Todos/:id", async (req, res) => {
  try {
    const todoId = req.params.id;

    // Check if the To-Do ID exists in the database
    const existingTodo = await Todo.findById(todoId);
    if (!existingTodo) {
      return res.status(404).json({ error: "To-Do not found" });
    }

    // Update the To-Do
    const { title, completed } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      todoId,
      { title, completed },
      { new: true }
    );

    res.json(updatedTodo);
  } catch (error) {
    console.error("Error updating To-Do:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/getPendingTodos", async (req, res) => {
  try {
    const pendingTodos = await Todo.find({ status: "pending" });
    res.json(pendingTodos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.put("/changeStatusTocompleted/:id", async (req, res) => {
  try {
    const todoId = req.params.id;

    // Check if the To-Do ID exists in the database
    const existingTodo = await Todo.findById(todoId);
    if (!existingTodo) {
      return res.status(404).json({ error: "To-Do not found" });
    }

    // Update the status to 'completed'
    const updatedTodo = await Todo.findByIdAndUpdate(
      todoId,
      { status: "completed" },
      { new: true }
    );

    res.json(updatedTodo);
  } catch (error) {
    console.error("Error changing status:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put("/changeStatusTopending/:id", async (req, res) => {
  try {
    const todoId = req.params.id;

    // Check if the To-Do ID exists in the database
    const existingTodo = await Todo.findById(todoId);
    if (!existingTodo) {
      return res.status(404).json({ error: "To-Do not found" });
    }

    // Update the status to 'pending'
    const updatedTodo = await Todo.findByIdAndUpdate(
      todoId,
      { status: "pending" },
      { new: true }
    );

    res.json(updatedTodo);
  } catch (error) {
    console.error("Error changing status:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



const blacklistedTokens = new Set();

app.post("/logout", (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    // Check if the token is in the blacklist
    if (blacklistedTokens.has(token)) {
      return res.status(401).json({ message: "Token is already blacklisted" });
    }

    // Add the token to the blacklist
    blacklistedTokens.add(token);

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Logout failed", error);
    res.status(500).json({ message: "Logout failed" });
  }
});

// Middleware to check if the token is blacklisted
const checkBlacklist = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: "Token is blacklisted" });
  }

  next();
};

// Protected route example
app.get("/protected", checkBlacklist, (req, res) => {
  res.status(200).json({ message: "Access granted to protected route" });
});