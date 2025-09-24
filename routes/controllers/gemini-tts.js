import mime from 'mime-types';
import { GoogleGenAI, Modality } from "@google/genai";

/* ---------- helpers ---------- */
function parseAudioMime(mimeType) {
    // ex: "audio/L16;rate=24000"
    let bits = 16;
    let rate = 24000;
    const parts = mimeType.split(';').map(p => p.trim());
    for (const p of parts) {
        if (p.toLowerCase().startsWith('rate=')) {
            rate = parseInt(p.split('=')[1], 10) || rate;
        }
        if (p.startsWith('audio/L')) {
            bits = parseInt(p.split('L')[1], 10) || bits;
        }
    }
    return { bitsPerSample: bits, sampleRate: rate };
}

function buildWavHeader(audioData, { sampleRate, bitsPerSample }) {
    const numChannels = 1;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = audioData.length;
    const fileSize = 36 + dataSize;

    const buffer = Buffer.alloc(44);
    let offset = 0;
    const writeStr = (s) => { buffer.write(s, offset); offset += s.length; };
    const writeUInt32LE = (n) => { buffer.writeUInt32LE(n, offset); offset += 4; };
    const writeUInt16LE = (n) => { buffer.writeUInt16LE(n, offset); offset += 2; };

    writeStr('RIFF');
    writeUInt32LE(fileSize);
    writeStr('WAVE');
    writeStr('fmt ');
    writeUInt32LE(16);               // subchunk1Size
    writeUInt16LE(1);                // PCM
    writeUInt16LE(numChannels);
    writeUInt32LE(sampleRate);
    writeUInt32LE(byteRate);
    writeUInt16LE(blockAlign);
    writeUInt16LE(bitsPerSample);
    writeStr('data');
    writeUInt32LE(dataSize);
    return Buffer.concat([buffer, audioData]);
}


export const GeminiTTS = async (req, res) => {
    try {
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const text = req.body.text || "Bonjour, je suis une assistante vocale. Comment puis-je vous aider ?";

        const contents = [{ role: 'user', parts: [{ text }] }];

        const config = {
            temperature: 1,
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: process.env.GEMINI_VOICE || 'Kore',
                    }
                }
            }
        };

        // 1. Appel classique (pas de vrai streaming)
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents,
            config
        });

        // 2. On récupère le premier morceau audio
        const part = response.candidates?.[0]?.content?.parts?.[0];
        const inline = part?.inlineData;

        if (!inline?.data) return res.status(204).send();

        const audioBuffer = Buffer.from(inline.data, 'base64');
        const mimeType = inline.mimeType || 'audio/L16;rate=24000';
        const params = parseAudioMime(mimeType);

        let finalBuffer = audioBuffer;
        let contentType = mimeType;

        if (!mimeType.includes('wav')) {
            finalBuffer = buildWavHeader(audioBuffer, params);
            contentType = 'audio/wav';
        }

        res.set({
            'Content-Type': contentType,
            'Content-Length': finalBuffer.length
        });
        res.send(finalBuffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }


}