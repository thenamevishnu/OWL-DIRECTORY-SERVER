import { Router } from "express";
import urlController from "../Controllers/url.controller.mjs";

const urlRoute = Router()

urlRoute.get("/fetch", urlController.getUrlComponents)
urlRoute.post("/add", urlController.addToDirectory)
urlRoute.get("/search", urlController.getSearch)
urlRoute.get("/suggestions", urlController.searchSuggestions)

export default urlRoute