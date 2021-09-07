var express = require('express');
var router = express.Router();

const bcrypt = require("bcrypt")
const { User } = require("./../models/user.model");
const jwt = require("jsonwebtoken");

const { authenticate, authorise } = require("./../middleware/auth")

const { createEntity } = require("./../helpers/actionHelper");


router.post('/register', async function (req, res, next) {
  try {
    // skipping validation for now
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    if (!(req.body.email || req.body.phone) && !req.body.password) {
      res.json({ error: "MISSING_PARAMETERS", message: "Please enter an email and password" });
    }

    const user = new User(req.body);

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    res.json(user);
 
  } catch (error) {
    if (error.code == 11000) res.json({ error: "EMAIL_CONFLICT", message: "Email address is already taken." });
    res.json({ error: "Register Error", message: error });
  }
});



router.post('/login', async function (req, res, next) {
  try {
    // Skipping Validation for now

    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ $or: [{ email: req.body.email.trim().toLowerCase() }, { phone: req.body.phone },] },).select("+password");
    if (!user) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res.status(400).send("Invalid email or password");

    const token = user.generateAuthToken();
    // const token = jwt.sign(user, process.env.TOKEN_SECRET);

    res.send(token);
  } catch (error) {
    res.status(500).send("An error occured");
  }
});



module.exports = router;