const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        dropDups: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        required: true,
        dropDups: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        type: String,
        require: true,
    },
    entity:
    {
        name: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        balance: {
            type: Number,
            default: 0.0
        },
        revenue: [
            {
                source: { type: String },
                amount: Number,
                date: {
                    type: Date,
                    default: Date.now()
                },
                comment: String,
            }
        ],
        expense: [
            {
                source: String,
                amount: Number,
                date: {
                    type: Date,
                    default: Date.now()
                },
                comment: String
            }
        ],
        reports: {},
        
        payroll: [
            {
                id: {
                    type: Schema.Types.ObjectId
                },
                name: String,
                role: String,
                phone: String,
                amount: Number
            }
        ]

    },
    shop: {
        inventory: [ // inventory list - 
            {
                id: { type: Schema.Types.ObjectId }, // Item id
                name: [{ type: String, required: true, trim: true }], // Item name - ["Brand","Model","submodel","Year"]  
                images: [{ type: String,}], // Item name - ["Brand","Model","submodel","Year"]  
                description: { type: String, },
                price: { type: Number, required: true, }, // Item price
                // specific for shoes 
                // colors: [{ name: { type: String }, hex: { type: String, trim: true } }],
                // Europe standard shoe size, use functions to  convert to other standard.
                units: [
                    {
                        color: { name: String, hex: String },
                        size: { type: Number, default: 0 }
                    }
                ],
            }
        ],
        sales: [
            {
                id: { type: Schema.Types.ObjectId }, // order id
                date: { type: Date, default: Date.now }, // order date
                cart_id: { type: String, required: true },
                shipping: {
                    type: { type: Number, required: true }, // wether it is regular or express shipping ie, 0 or 1 respectively
                    fee: { type: Number, required: true, }
                }, // Shipping fee
                total: { type: Number, required: true, }, // Item price
                status: { type: Number, required: true, }, // proccessing, shipped, delivered, returned.
            }
        ],
    },
    acc: {
        balance: {
            type: Number,
            default: 0.00
        },
        history:
            [
                {
                    id: {
                        type: Schema.Types.ObjectId
                    },
                    amount: { type: Number, required: true },
                    type: { type: String, required: true, lowercase: true, trim: true },
                    other: {
                        id: {
                            type: String
                        },
                        name: String,
                        date: { type: Date, default: Date.now },
                        comment: {
                            type: String,
                        }

                    }
                }
            ]
    }
});

/**
 * This function gets a new user authentication token
 * @returns a user token 
 */

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(JSON.stringify({ _id: this._id, name: this.name, avatar: this.avatar, email: this.email, phone: this.phone }), process.env.TOKEN_SECRET);
    return token;
};

/**
 * This function updates the users password
 * @returns Boolean 
 */
userSchema.methods.updateAdminPassword = function ({ phone, email, password }) {
    // adding a logic to only alter submitted values and not accidentally update unsubmitted values with undefined
    if (typeof phone != undefined) {
        this.phone = phone; // updating the phone value
    }
    if (typeof email != undefined) {
        this.email = email; // updating the email value
    }
    if (typeof password != undefined) {
        this.password = password; // updating the password value
    }
    return true;
};


const User = mongoose.model("user", userSchema);


module.exports = { User };