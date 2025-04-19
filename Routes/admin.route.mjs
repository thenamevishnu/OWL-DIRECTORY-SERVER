import { Router } from "express";
import adminController from "../Controllers/admin.controller.mjs";
import { AdminAuthorization } from "../Middleware/Authorization.mjs";

const adminRoute = Router()

adminRoute.get("/stat", AdminAuthorization, adminController.getStat)

export default adminRoute