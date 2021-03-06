const { User } = require("../models/user.model");
const mongoose = require("mongoose");

const getEntities = (userid) => {
    return new Promise((res, rej) => {
        User.findOne({ $or: [{ _id: userid }, { phone: userid }, { email: userid }] }).then((doc) => {
            if (doc) {
                res(doc.entity);
                return;
            }
            throw err;
        }).catch((err) => {
            rej(err);
        });

    });
}
const getEntityBalance = ({ userid, entity }) => {
    return new Promise((rej, res) => {
        User.find({ $or: [{ _id: userid }, { phone: userid }, { email: userid }] }, { $inc: { 'acc.balance': amount } }, function (err, doc) {
            if (err) res({ status: "failed", data: err });
            res(docs.entity);
        });
    });
}



const prepDate = () => {
    return new Promise((res, rej) => {
        // 2021-09-07T05:55:01.516Z
        var year = new Date().getUTCFullYear();
        var month = new Date().getUTCMonth();

        // 
        var sdate = `${year}-${month + 1}-01`;
        var edate = `${year}-${month + 2}-01`;
        var finalDate = {
            "s": sdate,
            "e": edate
        };
        res(finalDate);
    });
}

// gets the  current report

const getCurrentReport = (id,) => {
    return new Promise(async (res, rej) => {
        var revenue = await getMonthData(id, "revenue");
        var expense = await getMonthData(id, "expense");

        var totalRevenue = 0;
        var totalExpense = 0;
        var expenseHistory = [];
        var revenueHistory = [];

        // calculating the revenue
        console.log("revenue.length", revenue.length)
        if(revenue.length > 0){
            revenue[0].entity.forEach((element) => {
                totalRevenue += element.amount;
            })
            revenueHistory = revenue[0].entity;
        }

        // calculating the expense
        console.log("expense.length", expense.length)
        if(expense.length > 0){
            expense[0].entity.forEach((element) => {
                totalExpense += element.amount;
            })
            expenseHistory = expense[0].entity;
        }

        res({
            revenue:totalRevenue,
            expense:totalExpense,
            expenseHistory: expenseHistory,
            revenueHistory: revenueHistory,
        })
        // res({
        //     expense:expense,
        //     revenue:revenue
        // })
    })
}


const getMonthData = (id, field) => {3247034
    return new Promise(async (res, rej) => {
        var date = await prepDate();
        var firstDate = new Date(date.s);
        var other = new Date(date.e);
        User.aggregate([
            {
                "$match": {
                    "_id": mongoose.Types.ObjectId(id),
                    [`entity.${field}`]:
                        { "$elemMatch": { "date": { "$gte": firstDate, "$lt": other } } }
                }
            },
            {
                "$project": {
                    "entity": {
                        "$filter": {
                            "input": "$entity."+field,
                            "as": "elem",
                            "cond": {
                                "$and": [
                                    { "$gte": ["$$elem.date", firstDate] },
                                    { "$lt": ["$$elem.date", other] }
                                ]
                            }
                        }
                    }
                }
            }
        ])
            .then(data => {
                res(data);
            }).catch(err => {
                rej(err);
            })

    })
}


const updateRevenue = (source, amount, date, id) => {
    return new Promise(async (res, rej) => {
        // verify input
        var revenue = [`entity.balance`];
        User.updateOne(
            { '_id': id },
            { $push: { [`entity.revenue`]: { source: source, amount: amount, date: date } }, $inc: { [`entity.balance`]: amount } },
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

const updateExpense = (source, amount, date, id) => {
    return new Promise((res, rej) => {
        User.updateOne(
            { '_id': id },
            { $push: { [`entity.expense`]: { source: source, amount: amount, date: date } }, $inc: { [`entity.balance`]: -amount } },
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




// adding adds new element to the payroll
const addPayrollElement = (id, name, phone, amount, role) => {
    return new Promise((res, rej) => {
        // verify input
        User.updateOne(
            { '_id': id },
            { $push: { [`entity.payroll`]: { name: name, phone: phone, amount: amount, role: role } } },
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

module.exports = { getEntities, getEntityBalance, addPayrollElement, updateRevenue, updateExpense, getCurrentReport };
