import { model, Schema } from "mongoose";

const schema = new Schema({
    query: {
        type: String,
    }
}, {
    timestamps: true
})

export const SearchModel = model("searches", schema)