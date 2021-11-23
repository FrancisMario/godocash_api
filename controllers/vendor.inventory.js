var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/user.model");
const jwt = require("jsonwebtoken");


// list all inventory items. 
router.get('/', async function (req, res, next) {
  try {

    User.findById(req.user._id).then((doc) => {
      res.json(doc.shop.inventory);
    }).catch((err) => {
      console.log("err")
      throw err;
    });
  } catch (error) {
    // Todo, specify wether it's email or phone conflict
    console.log(error);
    res.status(301).json({ error: "SERVER_ERROR", message: "Server error occured" })
  }
});



router.post('/add', async function (req, res, next) {
  try {
    // Skipping Validation for now
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    // TODO
    // do a more indept data validation 
    if (!req.body.name, !req.body.description, !req.body.price) {
      throw "Insuficient data"
    }

    User.findById(req.user._id).then((doc) => {
      var tempDoc = {};
      tempDoc.name = req.body.name;
      tempDoc.description = req.body.description;
      tempDoc.price = req.body.price;
      // tempDoc.units = [];

      // JSON.parse(req.body.units).forEach(element => {
      //   tempDoc.units.push(element);
      // });

      doc.shop.inventory.push(tempDoc);
      doc.save().then((e) => {
        res.json(e);
        // var response = doc.shop.inventory.reverse();
      }).catch((e) => {
        console.log(e);
        throw e;
      });
    }).catch((err) => {
      console.log(err)
      throw err;
    });
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});


// add item unit
router.post('/unit/add', async function (req, res, next) {
  try {
    // Skipping Validation for now
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    // TODO
    // do a more indept data validation 
    if (!req.body.id || !req.body.count || !req.body.color || !req.body.size) {
      throw "Insuficient data"
    }
    User.findById(req.user._id).then((doc) => {
      var itemIndex = doc.shop.inventory.findIndex((e) => {
        return e._id == req.body.id;
      })
      if (itemIndex < 0) {
        throw `Incorrect Index:  ${itemIndex} : ${req.body.id}`;
      }
      for (let index = 0; index < req.body.count; index++) {
        doc.shop.inventory[itemIndex].units.push({
          size: req.body.size,
          color: req.body.color
        });
      }
      doc.save();
      res.json(doc.shop.inventory[itemIndex]);
    }).catch((err) => {
      console.log(req.body.units)
      console.log(err)
      res.status(401).send(err);
    });

  } catch (error) {
    console.log(error)
    res.status(500).send("An error occured");
  }
});



// add item unit
router.post('/unit/delete', async function (req, res, next) {

  try {
    // Skipping Validation for now
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    // TODO
    // do a more indept data validation 
    if (!req.body.item_id || !req.body.unit_id) {
      throw "Insuficient data"
    }
    User.findById(req.user._id).then((doc) => {
      try {
        // finding item index, 
        var itemIndex = doc.shop.inventory.findIndex((e) => {
          return e._id == req.body.item_id;
        })

        console.log(itemIndex);

        if (itemIndex < 0) {
          throw `Incorrect Index:  ${itemIndex} : ${req.body.id}`;
        }

        // mapping all unit values into new array skipping one to be deleted 
        var tempUnitsArray = doc.shop.inventory[itemIndex].units.filter((e) => {
          if (e != null) {
            if (!(e._id == req.body.unit_id)) return e;
          }
        })

        // updating the units array with new filtered one 
        doc.shop.inventory[itemIndex].units = tempUnitsArray;

        doc.save();
        res.json(doc.shop.inventory[itemIndex]);
      } catch (e) {
        throw e;
      }
    }).catch((err) => {
      throw err
    });

  } catch (error) {
    console.log(error)
    res.status(500).send("An error occured");
  }
});


module.exports = router;