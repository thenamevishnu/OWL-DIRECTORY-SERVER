import { model, Schema } from "mongoose"

const schema = new Schema({
    query: {
        type: String
    }
}, {
    timestamps: true
})

export const QueryModel = model("queries", schema)