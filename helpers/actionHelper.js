const { version } = require("mongoose");
const { User } = require("../models/user.model");

const getEntities = (userid) => {
    return new Promise((res, rej) => {
        User.findOne({ $or: [{ _id: userid }, { phone: userid }, { email: userid }] }).then((doc) => {
            console.log(doc);
            res(doc);
        }).catch((err) => {
            console.log(err);
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



const createEntity = (userid, name, location, starting_amount = 0, description) => {
    return new Promise(async (res, rej) => {
        let entity = {
            name: name,
            location: location,
            description: description
        }
        User.findOneAndUpdate(userid, { $push: { "entities": entity } }, { useFindAndModify: true }).then((doc) => {

            // if a starting balance was specified
            // code is broken... will fix in later times
            if (false) {
                var len = 0;
                if(doc.entities.length < 1){
                    console.log(doc.entities)
                } else {
                    len = doc.entities[doc.entities.length - 1].id;
                }
                console.log("docs length => ",doc.entities.length)
                console.log("entity => ",doc.entities[doc.entities.length - 1])
                addEntityTransaction(userid, len, 1, starting_amount, "capital", "starting balance");
            }
            res(doc);
        }).catch(err => {
            console.log("error", err)
            rej(false)
        })
    });
}


/**
 * 
 * @param {*} userid 
 * @param {*} id 
 * @param {*} type 
 * @param {*} amount 
 * @param {*} source 
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
        switch (type) {


            
            case 0:
                config = { $push: { "expense": transaction }, $inc: { 'balance': (0 - amount) } };
                console.log("flow is expense")
                break;
            default:
                console.log("flow is revenue")
                config = { $push: { "revenue": transaction }, $inc: { 'balance': amount } };
                break;
        }

        // console.log("quesry", query);
        User.findOneAndUpdate({ _id : userid, "entities.id" : id}, {"entities.$" : config}, { useFindAndModify: true, }).then((docs) => {
            res(docs);
        }).catch(err => {   
            console.log("errors", err)
            rej(false)
        })
    });
}


// adding adds new element to the payroll
const addPayrollElement = (userid, id, amount, name, phone) => {
    return new Promise((res, rej) => {
        let payroll = {
            name: name,
            phone: phone,
            amount: amount
        }
        User.findOneAndUpdate({ userid, entities: { $elemMatch: { id: id } } },
            { $push: { "payroll": payroll }, $inc: { 'balance': amount } },
            { useFindAndModify: true, }).then((docs) => {
                res(docs);
            }).catch(err => {
                console.log("error", err)
                rej(false)
            })
    });
}

module.exports = { addEntityTransaction, createEntity, getEntities, getEntityBalance, addPayrollElement };
