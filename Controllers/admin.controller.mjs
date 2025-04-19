import { DirectoryModel } from "../Models/directory.model.mjs"
import { QueryModel } from "../Models/search.model.mjs"
import { UserModel } from "../Models/user.model.mjs"

const getStat = async (request, response) => {
    try {
        const users = await UserModel.estimatedDocumentCount()
        const searches = await QueryModel.estimatedDocumentCount()
        const wesites = await DirectoryModel.aggregate([{
            $group: {
                _id: null,
                total: { $sum: 1 },
                deleted: { $sum: { $cond: ["$deleted", 1, 0] } },
                live: { $sum: { $cond: ["$deleted", 0, 1] } },
                blocked: { $sum: { $cond: ["$blocked", 1, 0] } }
            }
        }])
        const resObj = {
            total_users: users,
            total_searches: searches,
            total_websites: wesites?.[0].total || 0,
            deleted_websites: wesites?.[0].deleted || 0,
            live_websites: wesites?.[0].live || 0,
            blocked_websites: wesites?.[0].blocked || 0
        }
        return response.status(200).send({
            message: "Stat fetched successfully",
            stat: resObj
        })
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Error while fetching websites. Please try again."
        })
    }
}

export default {
    getStat
}