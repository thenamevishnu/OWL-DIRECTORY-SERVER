import { Router } from "express";
import authController from "../Controllers/auth.controller.mjs";

const authRoute = Router()

authRoute.post("/", authController.auth)

export default authRoute