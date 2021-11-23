var express = require('express');
var router = express.Router();
var { verify } = require('../../../sleek/api/helpers/customer/transaction.helper')

router.post('/verify', async function (req, res, next) {
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



module.exports = router;