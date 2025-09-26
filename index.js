import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/route.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: [process.env.DOMAIN_AUTORISE, "http://127.0.0.1:5500", "http://localhost:5500"]
}));

app.use(express.json())

app.use("/api", routes)

app.get("/", (req, res) => {
    res.send("Server TTS prêt");
});

const PORT = process.env.PORT || 3350;
app.listen(PORT, () => {
    console.log(`✅ Server Gemini TTS running sur le port ${PORT}`);
});
