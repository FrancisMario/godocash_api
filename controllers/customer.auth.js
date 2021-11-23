var express = require('express');
var router = express.Router();
var { auth, verify, details } = require('./../helpers/customer/auth.helper')

router.post('/', async function (req, res, next) {
    auth(req.body.phone).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        var errorMessage = null;
        switch (err) {
            case "MISSING_PARAMETERS":
                errorMessage = { error: err, message: "Please submit all required parameters" };
                break;
            default:
                errorMessage = { error: err, message: "Please submit all required parameters" };
                break;
        }
        res.status(401).send(errorMessage);
    })
});



router.post('/verify', async function (req, res, next) {
    verify(req.body.codeid, req.body.code).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        var errorMessage = null;
        switch (err) {
            case "INVALID_CODE":
                console.log("invalid code");
                errorMessage = { error: err, message: "Incorrect code, please try again." };
                break;
            case "CODE_EXPIRED":
                console.log("Code Expired");
                errorMessage = { error: err, message: "Code expired, please try again." };
                break;
            default:
                console.log("default");
                errorMessage = { error: err, message: "Please submit all required parameters" };
                break;
        }
        res.status(401).send(errorMessage);
    })
});


// TODO, Make this an authenticated route.
router.post('/verify/details', async function (req, res, next) {
    details(req.body).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        var errorMessage = null;
        switch (err) {
            case "MISSING_PARAMETERS":
                errorMessage = { error: "err", message: "Please submit all required parameters" };
                break;
            case "INVALID_CUSTOMER_ID":
                // This should never happen under normal circmstance,  
                // prolly someone reversed our customer apps and is probing our endpoints. 
                // can be mitigated on our side by making this an authenticated route
                // TODO, Report to IDS, and maybe block ip?
                errorMessage = { error: err, message: "The customer id you submitted is not valid, you are prolly trying to hack us." };
                break;
            default:
                errorMessage = { error: "err", message: "Please submit all required parameters" };
                break;
        }
        res.status(401).send(errorMessage);
    })
});



module.exports = router;