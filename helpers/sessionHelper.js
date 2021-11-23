const jwt = require("jsonwebtoken");
const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");
const { createToken } = require('./token.helper');
var uuid = require('uuid');


client.on("error", function(error) {
    //   Alert monitor and logging 
      console.error(error);
    });
    
    client.on("ready", function(error) {
        //   Alert monitor and logging 
          console.log("Session Db Connected!");
    });
    
    // asyncifying the methods 
    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client);
    
    /**
     * 
     * @param {String} code 
     * @param {String} codeid 
     * @param {String} newuser 
     * @param {String} phone 
     * @returns {boolean}
     */
    const storeOtpCode = (code, codeid, newcustomer, phone) => {
        return new Promise((res,rej) => {
            setAsync(codeid,JSON.stringify({code:code,phone:phone,isnewcustomer:newcustomer,date:Date.now()}))
            .then((value)=> {
                res(value)
            })
            .catch((err)=>{
                console.log("error 01")
                rej(err)
            });
        });
    }
    
    
    const getOtpCode = (codeid) => {
        return new Promise((res,rej) => {
            getAsync(codeid)
            .then((value)=> {
                // clear record from db to save mem
                res(value)
            })
            .catch((err)=>{
                // otp code was not found... bad login session, possibly critical internal error
                // alert monitor and logs, |3|
                rej(false)
            });
        });
    }
    
    
    /**
     * 
     * @param {*} userphone 
     * @param {*} signupcode 
     * @returns 
     */
    const storeTempUserData = (userphone,signupcode) => {
        return new Promise((res,rej) => {
            setAsync(signupcode, userphone)
            .then((value)=> {
                res(true)
            })
            .catch((err)=>{
                // data was not stored... critical internal error
                // alert monitor and logs |5|
                rej(false)
            });
        });
    }
    
    /**
     * 
     * @param {*} signupCode 
     * @returns 
     */
    const getTempUserData = (signupCode) => {
        return new Promise((res,rej) => {
            getAsync(signupCode)
            .then((value)=> {
                res(JSON.parse(value))
            })
            .catch((err)=>{
                // code code was not found... bad login session
                rej(false)
            });
        });
    }
    
    
    /**
     * for now, it's just a simple one liner... 
     * But makes sense to have it be a seperate module
     * incase we wanna do more complex stuff around the generation 
     * 
     * @returns String sessiontoken
     */
    const generatesessiontoken = (val) => {
        return new Promise(async (res,rej) =>{
            // todo, use jwt and hash user data in it
            var response = await createToken(val);
    
            if (!response) {
                rej("TOKEN_ERROR");
            }
            res(response);
        })
    } 

const decodeToken = (token) => {
    try {
        return jwt.decode(token, process.env.TOKEN_SECRET);
    } catch (error) {
        console.log(error);
        return false;
    }
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        return decoded;
    } catch (error) {
        console.log(error);
        return false;
    }
};

 
module.exports = {verifyToken, decodeToken, getOtpCode, storeOtpCode, storeTempUserData, getTempUserData, generatesessiontoken};