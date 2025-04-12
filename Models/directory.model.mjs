import { model, Schema } from "mongoose";

const schema = new Schema({
    title: {
        type: String,
    },
    description: {
        type: String
    },
    origin: {
        type: String
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    host_name: {
        type: String
    },
    icon: {
        type: String
    },
    added: {
        type: String,
        required: true
    },
    keywords: {
        type: [String]
    }
}, {
    timestamps: true
})

export const DirectoryModel = model("directories", schema)