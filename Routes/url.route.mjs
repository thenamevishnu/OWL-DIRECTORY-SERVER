import { Router } from "express";
import urlController from "../Controllers/url.controller.mjs";
import { Authorization } from "../Middleware/Authorization.mjs";

const urlRoute = Router()

urlRoute.get("/fetch", Authorization, urlController.getUrlComponents)
urlRoute.post("/add", Authorization, urlController.addToDirectory)
urlRoute.get("/search", urlController.getSearch)

urlRoute.post("/ai", urlController.getAiResponse)

export default urlRoute