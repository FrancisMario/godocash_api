const { version } = require("mongoose");
const { User } = require("../models/user.model");

const getEntities = (userid) => {
    return new Promise((res, rej) => {
        User.findOne({ $or: [{ _id: userid }, { phone: userid }, { email: userid }] }).then((doc) => {
            console.log(doc);
            if (doc.length > 0) {
                res(doc.entities);
                return;
            }
            res(doc.entities);
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
        
        var index = await getEntityIndex(userid);

        // if (index < 0) {
        //     // index generator failed
        //     rej(false);
        // }

        let entity = {
            name: name,
            location: location,
            index : index,
            description: description
        }
        
        User.findOneAndUpdate(userid, { $push: { "entities": entity } }, { useFindAndModify: true }).then((doc) => {

            // if a starting balance was specified
            // code is broken... will fix in later times..
            if (false) {
                var len = 0;
                if (doc.entities.length < 1) {
                    console.log(doc.entities)
                } else {
                    len = doc.entities[doc.entities.length - 1].id;
                }
                console.log("docs length => ", doc.entities.length)
                console.log("entity => ", doc.entities[doc.entities.length - 1])
                addEntityTransaction(userid, len, 1, starting_amount, "capital", "starting balance");
            }
            res(doc);
        }).catch(err => {
            console.log("error", err)
            rej(false)
        })
    });
}


// gets the  index of the new entity
const getEntityIndex = (id) => {
    console.log("id: ", id)
    return new Promise((res, rej) => {
        User.findOne({"_id" : id},).then((doc) => {
            console.log(doc);
            var len = doc.entities.length;
            res(len);
        }).catch((err) => {
            console.log(err);
            rej(-1);
        });
    })
}

const updateRevenue =  (source, amount, comment, id, index = 0) =>  {
    return new Promise(async (res, rej) => {
        // verify input
        console.log(source);
        console.log(amount);
        console.log(comment);
        console.log(id);
        var revenue = [`entities.${index}.balance`];
        User.updateOne(
            { '_id': id },
            { $push: { [`entities.${index}.revenue`]: { source: source, amount: amount, comment: comment } }, $inc: { [`entities.${0}.balance`]: amount } },
            (err, result) => {
                if (err) {
                    rej({ error: 'Unable to update revenue.', });
                } else {
                    res(result);
                }
            }
        );
    })
}

const updateExpense = (source, amount, comment, id, index = 0) => {
    return new Promise((res, rej) => {
        // verify input
        console.log(source);
        console.log(amount);
        console.log(comment);
        console.log(id);
        User.updateOne(
            { '_id': id },
            { $push: { [`entities.${index}.expense`]: { source: source, amount: amount, comment: comment } }, $inc: { [`entities.${0}.balance`]: -amount } },
            (err, result) => {
                if (err) {
                    rej({ error: 'Unable to update expense.', });
                } else {
                    res(result);
                }
            }
        );
    })
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
        User.findOneAndUpdate({ _id: userid, "entities.id": id }, { "entities.$": config }, { useFindAndModify: true, }).then((docs) => {
            res(docs);
        }).catch(err => {
            console.log("errors", err)
            rej(false)
        })
    });
}


// adding adds new element to the payroll
const addPayrollElement = (id, name, phone, amount, role, index = 0) => {
    return new Promise((res, rej) => {
        // verify input
        User.updateOne(
            { '_id': id },
            { $push: { [`entities.${index}.payroll`]: { name: name, phone: phone, amount: amount, role: role } } },
            (err, result) => {
                if (err) {
                    rej({ error: 'Unable to update payroll.', });
                } else {
                    res(result);
                }
            }
        );
    })
}

module.exports = { addEntityTransaction, createEntity, getEntities, getEntityBalance, addPayrollElement, updateRevenue, updateExpense };
