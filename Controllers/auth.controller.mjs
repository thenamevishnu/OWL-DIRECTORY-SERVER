import { UserModel } from "../Models/user.model.mjs";
import jwt from "jsonwebtoken"

const auth = async (request, response) => {
    try {
        const { email, picture, name } = request.body;
        if (!email) throw new Error("Please enter a valid email");
        if (!name) throw new Error("Please enter a valid name");
        if (!picture) throw new Error("Please enter a valid picture");
        let user = await UserModel.findOne({ email });
        if (!user) {
            user = await UserModel.create({ email, picture, name });
        } else {
            user.picture = picture;
            user.name = name;
            await user.save();
        }
        if (!user?.meta_code) {
            const meta_code = `${crypto.randomUUID().replace(/-/g, '')}${user._id}`;
            user.meta_code = meta_code;
            await user.save();
        }
        const token = jwt.sign({sub: {email, picture, name, meta_code: user.meta_code}}, process.env.JWT_SECRET, {expiresIn: "7d"})
        return response.status(200).send({
            message: "Login successful",
            token,
            meta_code: user.meta_code
        })
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Error while logging in. Please try again."
         })
    }
}

export default { auth }