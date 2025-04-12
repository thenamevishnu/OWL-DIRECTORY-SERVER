import { connect } from "mongoose"

export const db = {
    config: async () => {
        try {
            const { connection: { db: { databaseName } } } = await connect(process.env.MONGO_URL, {
                dbName: process.env.DB_NAME
            })
            console.log(`Connected to ${databaseName}`);
        } catch (error) {
            return process.exit(1)   
        }
    }
}