import { UserModel } from "../Models/user.model.mjs";

const auth = async (request, response) => {
    try {
        const { email, picture, name } = request.body;
        if (!email) throw new Error("Please enter a valid email");
        if (!name) throw new Error("Please enter a valid name");
        if (!picture) throw new Error("Please enter a valid picture");
        const user = await UserModel.findOne({ email });
        if (!user) {
            await UserModel.create({ email, picture, name });
        } else {
            user.picture = picture;
            user.name = name;
            await user.save();
        }
        return response.status(200).send({
            message: "Login successful"
        })
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Error while logging in. Please try again."
         })
    }
}

export default { auth }