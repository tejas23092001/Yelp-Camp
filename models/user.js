const mongoose = require("mongoose")
const Schema = mongoose.Schema
const passsportlocalmongoose = require("passport-local-mongoose")

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.plugin(passsportlocalmongoose)

module.exports = mongoose.model("User", userSchema)