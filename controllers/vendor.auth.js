var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt")
const { User } = require("../models/user.model");
const jwt = require("jsonwebtoken");


// The two unauthenticated routes needed in the system. 

router.post('/register', async function (req, res, next) {
  try {

    // skipping auth for now
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    if (
      !(req.body.email || req.body.phone || req.body.key || req.body.password) ||
      !(req.body.shop || req.body.address) ||
      !(req.body.firstname || req.body.lastname || req.body.middlename)) {
      // TODO.Send helpfull specific messages as to which parameters are not normal 
      res.json({ error: "MISSING_PARAMETERS", message: "Please provide all required parameters" });
    }

    const vendor = new User(req.body);
    vendor.name.name = [req.body.firstname, req.body.middlename, req.body.lastname];
    vendor.name.shopname = req.body.shopname;
    vendor.name.address = req.body.address;

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    vendor.password = await bcrypt.hash(vendor.password, salt);
    await vendor.save();
    res.json(vendor);
  } catch (error) {
    // Todo, specify wether it's email or phone conflict
    if (error.code == 11000) res.json({ error: "EMAIL_CONFLICT", message: "Email address is already taken." });
    res.json({ error: "Register Error", message: error });
  }
});


router.post('/auth', async function (req, res, next) {
  try {
    // Skipping Validation for now

    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    const vendor = await User.findOne({ $or: [{ email: req.body.email.trim().toLowerCase() }, { phone: req.body.phone },] },).select("+password");
    if (!vendor) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(
      req.body.password,
      vendor.password
    );

    if (!validPassword)
      return res.status(400).send("Invalid email or password");

    // const token = jwt.sign(user, process.env.TOKEN_SECRET);
    const token = vendor.generateAuthToken();

    res.send({
      token: token, 
      name: vendor.name.name.toString().replace(","," ").replace(","," "),
      email: vendor.email,
      phone: vendor.phone,
      balance: vendor.acc.balance,
      history: vendor.shop.sales
    });
  } catch (error) {
    res.status(500).send("An error occured");
  }
});



module.exports = router;