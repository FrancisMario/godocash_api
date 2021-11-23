const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const { User } = require("../../models/user.model");
const { storeOtpCode, getOtpCode, generatesessiontoken } = require("../sessionHelper");
const { verifyphone } = require("../inputs.helper");
var uuid = require('uuid');
const { decodeToken } = require("../token.helper");


/**
 * 
 * @param {String} phone
 * To check if the Customer is already signed up or not..
 * if so, send otp code and store and flag the user will needs to be created after code is verified.
 * otherwise just send code and user will be logged in.
 * 
 */
const auth = (phone) => {
    return new Promise(async (res, rej) => {
        try {
            if (!phone || !verifyphone(phone)) {
                rej("PARAMETER_ERROR");
            }
            const customer = await User.findOne({ phone: phone.trim() });

            var newcustomer = false; // default state is false

            // Customer was not in database so it's a new Customer
            if (!customer) newcustomer = true;

            var code = Math.floor(1000 + Math.random() * 9000); // generating OTP code
            var codeid = uuid.v4(); // OTP code id

            storeOtpCode(code, codeid, newcustomer, phone)
                .then((val) => {
                    res({ codeid: codeid, code: code }); // respond to user with code id to be used in verification request
                })
                .catch((err) => {
                    // A very Critical error occured, 
                    // already alerted monitor and logs from up the stack, no need to do so here.
                    rej("CRITICAL_ERROR")
                })
        } catch (error) {
            // Should rarely get to this point unless some very obsqure bug
            // TODO , alert monitor and logs 
            rej("REGISTRATION_ERROR");
        }
    });
};


/**
 * 
 * @param {*} phone
 * Verify submitted otp code with store otp code, logs user in and asks for more data if customer is new. 
 */
const verify = (codeid, rcode) => {
    return new Promise((res, rej) => {
        try {
            console.log("landed in the verify method");
            if (!codeid || !rcode) {
                // res.status(401).send({ error: "MISSING_PARAMETERS", message: "Please enter a code" });
                console.log("missing parameters");
                rej("MISSING_PARAMETERS");
            }
            /**
             * Verifying code is valid by retrieving the one stored in DB
                 * 
                 * Data Shape
                 * {code ,phone, isnewuser, timestamp}
             */
            getOtpCode(codeid)
                .then(async (data) => {
                    var { code, date, isnewcustomer, phone } = JSON.parse(data);

                    if ((+rcode) != (+code)) {
                        res("INVALID_CODE");
                    }

                    // checking if the code is expired
                    var diffMs = (Date.now() - new Date(date)); // milliseconds between now & expiration
                    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

                    if (diffMins > 30) { // checking if the code validity period has been exceeded.
                        res("CODE_EXPIRED");
                    }

                    // Apperently everything is fine is dope.
                    // Generate the session key and collect device fingerprint
                    const customer = await User.findOne({ phone: phone.trim() });
                    if (!customer) {
                        var newcustomer = User({ phone: phone });
                        newcustomer.save()
                            .then((val) => {
                                console.log(val)
                                // only create session and return session key
                                generatesessiontoken(val._id).then((value) => {
                                    // all went well, return sessiontoken to customer
                                    res({ token: value, customer: val })
                                })
                            })
                            .catch((err) => {
                                console.log(err);
                                rej("SIGNUP_ERROR")
                            });
                    }

                    // not a new user so just log em in
                    generatesessiontoken(customer._id).then((value) => {
                        // all went well, return sessiontoken to customer
                        res({ token: value, customer: customer })
                    })

                })
                .catch((err) => {
                    // prolly not the right error code but the this will work for now. 
                    rej("INVALID_CODE");
                })
        } catch (error) {
            rej("REGISTRATION_ERROR");
        }
    });
};

const details = ({ name, email, avatar, token }) => {
    return new Promise(async (res, rej) => {

        // TODO, more error catchings and input sanitisations
        var customertoken = decodeToken(token)

        const customer = await User.findOne({ _id: customertoken.id });

        if (!customer) { rej("INVALID_CUSTOMER_ID"); return; }

        customer.name = name;
        customer.email = email;
        customer.avatar = avatar;
        customer.save();
        res(customer)
    })
}


/**
 * Sends an sms to a phone number and stores the sms code in the sms
 * @param {*} phone 
 * @returns boolean
 */
const sendSMS = (phone) => {
    return new Promise((req, res) => {
        try {
            // sms sending api

        } catch (error) {

        }
    });
}


const createnewcustomer = (phone) => {
    return new Promise((res, rej) => {
        new User({ phone: phone }).then((val) => {
            res(val._id);
        }).catch((err) => {
            rej(false);
        })
    })

}


module.exports = { auth, verify, details };