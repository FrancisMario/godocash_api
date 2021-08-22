const jwt = require("jsonwebtoken");

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

 
module.exports = {verifyToken, decodeToken};