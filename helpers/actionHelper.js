const { version } = require("mongoose");
const { User } = require("../models/user.model");

const getEntities = (userid) => {
    return new Promise((res, rej) => {
        User.findOne({ $or: [{ _id: userid }, { phone: userid }, { email: userid }] }).then((doc) => {
            console.log(doc);
            res(doc.acc.entity);
        }).catch((err) => {
            rej(err);
        });

    });
}

const getEntityBalance = ({ userid, entity }) => {
    return new Promise((rej, res) => {
        User.find({ $or: [{ _id: userid }, { phone: userid }, { email: userid }] }, { $inc: { 'acc.balance': amount } }, function (err, doc) {
            if (err) res({ status: "failed", data: err });
            console.log(docs);
            res(docs.entity);
        });
    });
}



const createEntity = (userid, name, location, starting_amount = 0) => {
    return new Promise(async (res, rej) => {

        let entity = {
            name: name,
            location: location,
        }

        User.findOneAndUpdate(userid, { $push: { table: entity } }, { useFindAndModify: true }).then((doc) => {
            // if a starting balance was specified
            if (starting_amount > 0) {
                addEntityTransaction(userid, doc.id, 1, starting_amount, "capital", "starting balance");
            }
            res(doc);
        }).catch(err => {
            console.log("error")
            rej(false)
        })
    });
}


/**
 * Adds a revenure add or an expense deduction.
 * and updates entity total
 * @param {*} userid 
 * @param {*} amount 
 * @param {*} type 
 * @param {*} comment 
 * @returns 
 */

// adding transaction history and updating balance
const addEntityTransaction = (userid, id, type, amount, source, comment) => {
    return new Promise((res, rej) => {

        let transaction = {
            amount: amount,
            source: source,
            comment: comment
        }

        var config = {};
        switch (type == 0) {
            case value:
                config = { $push: { "expense": transaction }, $inc: { 'balance': (0 - amount) } };
                break;
            default:
                config = { $push: { "revenue": transaction }, $inc: { 'balance': amount } };
                break;
        }
        User.findOneAndUpdate({ userid, entities: { $elemMatch: { id: id } } }, config, { useFindAndModify: true,}).then((docs) => {
            res(docs);
        }).catch(err => {
            console.log("error")
            rej(false)
        })
    });
}

module.exports = { performTransaction, getUserHistory, getUserBalance };
