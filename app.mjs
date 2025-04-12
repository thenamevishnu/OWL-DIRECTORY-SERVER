import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json())

app.listen(8081, () => console.log("Server running on port 8081"))