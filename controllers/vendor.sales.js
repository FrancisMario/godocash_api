var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt")
const { User } = require("../models/user.model");
const jwt = require("jsonwebtoken");


// get orders

/**
 * can get the following
 * all new orders: @param req.body.type = 0.
 * all completed orders: @param req.body.type = 1.
 * all cancelled orders: @param req.body.type = 2.
 * All queries will have a default limit of 20 @param req.body.limit = 20
 * And a default skip of 0 @param req.body.skip = 0
 * All queries will be ordered by date in desending order 
 */
router.get('/sales/', async function (req, res, next) {

  try {
    // Skipping Validation for now
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    // TODO
    // do a more indept data validation 
    if (!req.body.type) {
      throw "Insuficient data"
    }

    User.findById(req.user._id).then((doc) => {
      // finding item index, 
      var itemIndex = doc.shop.sales.findIndex((e) => { 
        return e._id == req.body.item_id;
      })

      if (itemIndex < 0) {
        throw `Incorrect Index:  ${itemIndex} : ${req.body.id}`;
      }

      // mapping all unit values into new array skipping one to be deleted 
      var tempUnitsArray = doc.shop.inventory[itemIndex].units.filter((e) => {
        if (e != null) {
          if (!(e._id == req.body.unit_id)) return e;
        }
      })

      res.json(doc.shop.inventory[itemIndex]);
    }).catch((err) => {
      throw err
    });

  } catch (error) {
    console.log(error)
    res.status(500).send("An error occured");
  }
});


module.exports = router;