import { EdgeTTS } from "@travisvn/edge-tts";
import { Buffer } from "buffer";


function splitText(text, maxLength) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        chunks.push(text.slice(start, start + maxLength));
        start += maxLength;
    }
    return chunks;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function synthesizeChunkWithRetry(chunk, voice, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {

            const tts = new EdgeTTS(chunk, voice);
            const result = await tts.synthesize();
            return Buffer.from(await result.audio.arrayBuffer());
        } catch (err) {
            console.warn(`Erreur chunk (tentative ${attempt}): ${err.message}`);
            if (attempt === maxRetries) throw err;
            await sleep(500);
        }
    }
}

async function synthesizeAdaptive(chunks, voice) {

    const allBuffers = [];
    let batchSize = 5;  // départ
    let pauseMs = 1000; // départ
    const responseTimes = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        const startTime = Date.now();
        const batchBuffers = await Promise.all(
            batch.map(chunk => synthesizeChunkWithRetry(chunk, voice))
        );
        const duration = Date.now() - startTime;

        allBuffers.push(...batchBuffers);
        responseTimes.push(duration);

        // Ajustement adaptatif
        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

        // Si trop rapide → augmenter batchSize
        if (avgTime < 1500 && batchSize < 10) batchSize++;
        // Si trop lent → réduire batchSize et augmenter pause
        if (avgTime > 3000 && batchSize > 1) batchSize--;
        pauseMs = Math.max(500, Math.min(2000, Math.floor(avgTime / batch.length)));

        // Pause entre les lots
        if (i + batchSize < chunks.length) {
            await sleep(pauseMs);
        }
    }

    return Buffer.concat(allBuffers);
}

// Route Express
export const Ege_TTS = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "text requis" });

        const voice = "fr-BE-CharlineNeural";
        const chunks = splitText(text, 800);

        const finalAudioBuffer = await synthesizeAdaptive(chunks, voice);

        res.setHeader("Content-Type", "audio/mpeg");
        res.send(finalAudioBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur interne" });
    }
};