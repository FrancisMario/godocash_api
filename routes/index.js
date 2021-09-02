var express = require('express');
var router = express.Router();
const { User } = require("./../models/user.model")
const { verifyToken, decodeToken } = require("./../helpers/sessionHelper");
const { getUserBalance,  performTransaction } = require("./../helpers/transactionHelper");
const { addEntityTransaction, createEntity, getEntities, getEntityBalance, addPayrollElement } = require("./../helpers/actionHelper");
const bcrypt = require("bcrypt");
/***
 * Returns user account details 
 * 
 * name 
 * account id
 * balance
 * history
 */
router.get('/me', async function (req, res, next) {

  const user = await decodeToken(req.header("x-auth-token"));

  console.log(user);

  User.findById(user._id).select("-password").then((doc) => {
    res.send({
      status: "success",
      data: doc
    });
  }).catch((err) => {
    res.status(500).send({
      status: "error",
      error: err
    });
  });
});

router.get('/history', async function (req, res, next) {

  const user = await decodeToken(req.header("x-auth-token"));

  console.log(user);
  User.findById(user._id).select("-password").then((doc) => {
    res.send({
      status: "success",
      data: doc.acc.history
    });
  }).catch((err) => {
    res.status(500).send({
      status: "error",
      error: err
    });
  });
});

// post new transaction to the system.
router.post('/send', function (req, res, next) {

  const { recipient, amount, comment } = req.body;

  console.log("recipient: ",recipient);
  console.log("amount: ",amount);
  console.log("comment: ",comment);

  // get usr id from token, ie decode the token.
  const user = decodeToken(req.header("x-auth-token"));

  // check if user has cash greater than the amount he is transfering
  getUserBalance(user._id).then((val) => {
    // making sure the user has enough cash to send
    if ((val < amount) || !val) {
      res.status(401).send({
        status: "Error",
        error: "insufficient balance",
        data: val
      });
      return;
    }
    performTransaction({userid:user._id, recipient:recipient, amount:amount, comment:comment}).then(value => {
      res.send({
        status: "Success",
        data: value
      });
    }).catch(err => {
      res.status(500).send({
        status: "Error",
        error: "Transaction Error",
        data: val
      });
    });
  }).catch((err) => {
    res.status(500).send({
      status: "Error",
      error: "Transaction Error",
      data: err
    });
    return;
  });
});

router.post('/entity', async function (req, res, next) {

  const user = await decodeToken(req.header("x-auth-token"));

  console.log(user);

  const { name, location, starting_amount, description } = req.body;

  createEntity(user._id, name, location, starting_amount, description).then((doc) => {
    res.send({
      status: "success",
      data: doc
    });
  }).catch((err) => {
    res.status(500).send({
      status: "error",
      error: err
    });
  });
});


router.get('/entity', async function (req, res, next) {

  const user = await decodeToken(req.header("x-auth-token"));

  console.log(user);

  const { name, location, starting_amount } = req.body;

  getEntities(user._id).then((doc) => {
    res.send({
      status: "success",
      data: doc
    });
  }).catch((err) => {
    res.status(500).send({
      status: "error",
      error: err
    });
  });
});

module.exports = router;
