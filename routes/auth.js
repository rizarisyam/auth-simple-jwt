const router = require("express").Router();
const User = require("../model/User");
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const regval = registerValidation(req.body);

  if (regval.hasOwnProperty("error")) {
    return res
      .status(400)
      .send(regval.error.details.forEach((value) => res.send(value.message)));
  }

  const emailExists = await User.findOne({ email: req.body.email });

  if (emailExists) return res.status(400).send("Email Already exists");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
  });

  try {
    const savedUser = await user.save();
    //   create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).send(token);
    res.redirect("/dashboard");
    // res.send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  const logVal = loginValidation(req.body);

  if (logVal.hasOwnProperty("error"))
    return res
      .status(400)
      .send(logVal.error.details.forEach((error) => res.send(error.message)));

  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("Email or Password is wrong");

  const validPass = await bcrypt.compare(req.body.password, user.password);

  if (!validPass) return res.status(400).send("Email or Password is wrong");

  //   create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token);
  //   sessionStorage.setItem("auth-token", token);
  res.redirect("/dashboard");
  //   res.send("Login success");
});

module.exports = router;
