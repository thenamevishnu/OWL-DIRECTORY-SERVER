import { model, Schema } from "mongoose";

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    picture: {
        type: String,
        required: true
    },
    meta_code: {
        type: String
    }
}, {
    timestamps: true
})

export const UserModel = model("users", schema)