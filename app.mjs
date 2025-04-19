import e from "express";
import cors from "cors"
import { db } from "./Config/db.config.mjs";
import authRoute from "./Routes/auth.route.mjs";
import websiteRoute from "./Routes/website.controller.mjs";
import adminRoute from "./Routes/admin.route.mjs";

const app = e()

await db.config()

app.use(cors())
app.use(e.json())
app.use("/assets", e.static("assets"))

app.get("/api/v1", (req, res) => res.send("Hello World!"))

app.use("/v1/auth", authRoute)
app.use("/v1/website", websiteRoute)
app.use("/v1/admin", adminRoute)

app.listen(process.env.PORT || 8081, () => {
    console.log(`Server running on port ${process.env.PORT || 8081}`);
});