import e from "express";
import cors from "cors"
import urlRoute from "./Routes/url.route.mjs";
import { db } from "./Config/db.config.mjs";
import authRoute from "./Routes/auth.route.mjs";

const app = e()

await db.config()

app.use(cors())
app.use(e.json())
app.use("/assets", e.static("assets"))

app.use("/v1/url", urlRoute)
app.use("/v1/auth", authRoute)

app.listen(process.env.PORT || 8081, () => {
    console.log(`Server running on port ${process.env.PORT || 8081}`);
});