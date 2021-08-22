const { User } = require("../models/user.model");
const jwt = require("jsonwebtoken");

 const authenticate = async (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.status(403).send("Access denied.");
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        if(verified){
            req.user = verified;
            next();
            return;
        }
        res.status(401).send("Access denied");
    } catch (error) {
        res.status(401).send("Authorisation Error");
    }
};


const authorise = async (req, res, next) => {
    try { 
        const token = req.header("x-auth-token");
        if (!token) return res.status(403).send("Access denied.");
        const decoded = jwt.decode(token, process.env.TOKEN_SECRET);
        // check if user has rights to access this resource
        if (decoded.rights.includes(req.routecode)) {
            next();
            return;
        } 
        res.status(401).send("Not Authorised");
    } catch (error) {
        res.status(401).send("Authorisation Error");
    }
};
 
module.exports = {authenticate, authorise};