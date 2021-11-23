const { version } = require("mongoose");
const { Customer } = require("../../models/customer.model");


const verify = (recipientid) => {
    return new Promise((res, rej) => {
        if (recipientid) {
            
        }
        Customer.findOne({$or : [ { _id: Customerid }, { phone:Customerid }, { email:Customerid } ]}).then((doc) => {
            
            res(doc.acc.balance);
        }).catch((err) => {
            rej(err);
        });

    });
}


 const getCustomerBalance = (Customerid) => {
    return new Promise((res, rej) => {
        Customer.findOne({$or : [ { _id: Customerid }, { phone:Customerid }, { email:Customerid } ]}).then((doc) => {
            
            res(doc.acc.balance);
        }).catch((err) => {
            rej(err);
        });

    });
}

 const getCustomerHistory = ({ Customerid, amount }) => {
    return new Promise((rej, res) => {
        Customer.find({$or : [ { _id: Customerid }, { phone:Customerid }, { email:Customerid } ]}, { $inc: { 'acc.balance': amount } }, function (err, doc) {
            if (err) res({ status: "failed", data: err });
            
            res(docs);
        });
    });
}



 const performTransaction = ( {Customerid, recipient, amount, comment} ) => {
    return new Promise((res, rej) => {
        
        // TODO
        // Make this a transaction to avoid incomplete data

        
        // this enables Customers to use any either account id, email or phone to perform transactions
        const prepQuery = (id) => {
            let query = {};
            /// adding check to see if the Customer id is an object id or not:
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                // it's an ObjectID    
                query = { _id: id };
            } else {
                //  its an email or phone
                query = {$or : [  { phone:id }, { email:id } ]};
            }    
            return query;
        }


        // updating the the senders balance
        Customer.findOneAndUpdate(prepQuery(Customerid), { $inc: { 'acc.balance': (amount - amount) - amount  }}, {useFindAndModify:true}, function (err, doc) {
            if (err) rej({ status: "failed", data: err });

            // updating the senders history
            addCustomerHistory(prepQuery(Customerid), recipient, amount, "sent", comment).then((val) => {
            // updating the the recipient balance
        
            Customer.findOneAndUpdate(prepQuery(recipient), { $inc: { 'acc.balance':  amount  }}, {useFindAndModify:true}, function (err, doc) {
            if (err) rej({ status: "failed", data: err });
            // updating the recipient history
            addCustomerHistory(prepQuery(recipient),Customerid, amount, "recieve", comment).then(val => {
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


 const addCustomerHistory = (Customerid, other, amount, type, comment) => {
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
        Customer.findOneAndUpdate( Customerid , { $push: { 'acc.history': history } }, {useFindAndModify:true}).then((docs) => {
            res(docs);
        }).catch(err => {
            console.log("error")
            rej(false)
        })
    });
}

module.exports = {verify};
