export const ElevenLabs = async (req, res) => {
    try {

        const { text } = req.body;

        if (!text) return res.status(400).send("Paramètre 'text' manquant");

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_LABS_VOICE}`, {
            method: "POST",
            headers: {
                "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
                "Content-Type": "application/json",
                "Accept": "audio/ogg",
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_multilingual_v2",
                output_format: "ogg_44100_64",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).send(errorText);
        }

        const buffer = await response.arrayBuffer();

        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Disposition": `inline; filename="audio.mpeg"`,
        });
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur serveur");
    }
}