import { Router } from "express"
import { Authorization } from "../Middleware/Authorization.mjs"
import websiteController from "../Controllers/website.controller.mjs"

const websiteRoute = Router()

websiteRoute.get("/list", Authorization, websiteController.getMyWebsites)
websiteRoute.delete("/delete/:id", Authorization, websiteController.deleteMyWebsite)
websiteRoute.get("/fetch", Authorization, websiteController.getUrlComponents)
websiteRoute.post("/add", Authorization, websiteController.addToDirectory)
websiteRoute.get("/search", websiteController.getSearch)

websiteRoute.post("/ai", websiteController.getAiResponse)

export default websiteRoute