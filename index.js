const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// connect to DB
mongoose.connect(process.env.DB_CONNECT, () => console.log("connected to db!"));
// import route
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const verify = require("../simple-auth/verifyToken");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("welcome");
});

app.get("/register", (req, res) => {
  res.render("auth/register");
});

app.get("/login", (req, res) => {
  res.render("auth/login");
});

app.get("/dashboard", verify, (req, res) => {
  res.render("dashboard");
});

app.use("/api/user", authRoute);
app.use("/api/posts", postRoute);

app.listen(3000, () => console.log(`Server Up and running`));
