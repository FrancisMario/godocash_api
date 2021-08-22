const { version } = require("mongoose");
const { User } = require("../models/user.model");

 const getUserBalance = (userid) => {
    return new Promise((res, rej) => {
        User.findOne({$or : [ { _id: userid }, { phone:userid }, { email:userid } ]}).then((doc) => {
            console.log(doc);
            res(doc.acc.balance);
        }).catch((err) => {
            rej(err);
        });

    });
}

 const getUserHistory = ({ userid, amount }) => {
    return new Promise((rej, res) => {
        User.find({$or : [ { _id: userid }, { phone:userid }, { email:userid } ]}, { $inc: { 'acc.balance': amount } }, function (err, doc) {
            if (err) res({ status: "failed", data: err });
            console.log(docs);
            res(docs);
        });
    });
}



 const performTransaction = ( {userid, recipient, amount, comment} ) => {
    return new Promise((res, rej) => {
        
        // TODO
        // Make this a transaction to avoid incomplete data

        
        // this enables users to use any either account id, email or phone to perform transactions
        const prepQuery = (id) => {
            console.log("parameter is: ", id);
            let query = {};
            /// adding check to see if the user id is an object id or not:
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                // it's an ObjectID    
                query = { _id: id };
            } else {
                //  its an email or phone
                query = {$or : [  { phone:id }, { email:id } ]};
            }    
            console.log(id ," => ", query);
            return query;
        }


        // updating the the senders balance
        User.findOneAndUpdate(prepQuery(userid), { $inc: { 'acc.balance': (amount - amount) - amount  }}, {useFindAndModify:true}, function (err, doc) {
            if (err) rej({ status: "failed", data: err });

            // updating the senders history
            addUserHistory(prepQuery(userid), recipient, amount, "sent", comment).then((val) => {
            // updating the the recipient balance
        
            User.findOneAndUpdate(prepQuery(recipient), { $inc: { 'acc.balance':  amount  }}, {useFindAndModify:true}, function (err, doc) {
            if (err) rej({ status: "failed", data: err });
            // updating the recipient history
            addUserHistory(prepQuery(recipient),userid, amount, "recieve", comment).then(val => {
                res(val);
            }).catch(err => {
                rej(err);
            });
        
        });
            }).catch(err => {
                rej(err);
            }); ;
        });
    });
};


 const addUserHistory = (userid, other, amount, type, comment) => {
    return new Promise((res, rej) => {
        let history = {
            amount: amount, 
            type: type,
            other: {
              id: other,
              name: other,
              comment: comment
            }
        }
        User.findOneAndUpdate( userid , { $push: { 'acc.history': history } }, {useFindAndModify:true}).then((docs) => {
            res(docs);
        }).catch(err => {
            console.log("error@@@@")
            rej(false)
        })
    });
}

module.exports = {performTransaction, getUserHistory, getUserBalance};
