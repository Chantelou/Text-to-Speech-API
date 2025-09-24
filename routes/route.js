import express from "express"
import { GeminiTTS } from "./controllers/gemini-tts.js"
import { ElevenLabs } from "./controllers/ElevenLabs.js"
import { Ege_TTS } from "./controllers/edge-tts.js"

const routes = express.Router()

//Routes pour Text to speech
routes.post("/gemini-tts", GeminiTTS) //gemini tts (free-tiers: 15 req par heure gratuit)
routes.post("/11labs", ElevenLabs) // Eleven (labs payant)
routes.post("/edge-tts", Ege_TTS) //Egde open-source (gratuit)

export default routes