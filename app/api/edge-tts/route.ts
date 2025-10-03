import { NextResponse } from "next/server";
import { EdgeTTS } from '@travisvn/edge-tts';
import { Buffer } from 'buffer';
export const runtime = 'nodejs';

// Fonction utilitaire pour découper le texte
function splitText(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        chunks.push(text.slice(start, start + maxLength));
        start += maxLength;
    }

    return chunks;
}

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: "text requis" }, { status: 400 });
        }

        const selectedVoice = "fr-FR-DeniseNeural";
        const chunks = splitText(text, 800);

        // Générer chaque morceau
 
        const tts = new EdgeTTS(text, selectedVoice);
        const result = await tts.synthesize();

        const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

        // Retourner la réponse audio
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
            },
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}