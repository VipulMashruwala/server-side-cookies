const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promotionSchema = new Schema({
    name : {
        type: String,
        unique: true,
        required: true
    },
    image : {
        type: String,
        required: true
    },
    label : {
        type: String,
        default: ''
    },
    price : {
        type: Number,
        min: 0,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    featured : {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});


const Promotions = mongoose.model('Promotion',promotionSchema)
module.exports = Promotions;