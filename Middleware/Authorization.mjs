import jwt from "jsonwebtoken"

export const Authorization = (request, response, next) => {
    try {
        const tokenString = request.headers.authorization;
        if (!tokenString) return response.status(401).send({
            message: "You are not authorized to perform this action"
        })
        const [_, token] = tokenString.split(" ");
        if (!token) return response.status(401).send({
            message: "You are not authorized to perform this action"
        })
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) return response.status(401).send({
                message: "You are not authorized to perform this action"
            })
            next();
        } catch (_err) {
            return response.status(401).send({
                message: "You are not authorized to perform this action"
            })
        }
    } catch (_err) {
        return response.status(401).send({
            message: "You are not authorized to perform this action"
        })
    }
}