const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());

// --- CONFIGURATION ---
const ACCESS_TOKEN = "EAANJPcKZAFDQBQzOvHQLvtwGl6fCenfh41wsxWhzD1HuRlUBelX0oA5PQKR2jhIhCLEUnoQ1vieZByGYWjINLZAiwfi4Sv1jV9vXunaA2QO9Ghk4diWDv2Srz1jik1oZBin949ZCK7AUINmZAAsEOKiezZAZCDZARhv58uBZAVNOux9Ih9ur2RSvDYvcekj9g9nZBmI4yJQrBefcAmZCZCwUhLGNdgtb6ZAQUwVQFUZB9njxWIf20cPHni0mvybVeWTpwFWDcjPa7iIH0LP7J3pmq4Q1RdMVsvChnNd4nQUtGQ1EbAZD";
const VERIFY_TOKEN = "Nour_Web3_2026";
const GAME_URL = "https://original-hxzk.onrender.com";

// 1. AFFICHAGE DU SITE (Ton jeu de spins)
// Cette partie permet d'afficher ton fichier HTML quand on visite le lien
app.get('/', (req, res) => {
    res.send(`<h1>Bienvenue sur ton Jeu de Spins !</h1><p>Connecte ton wallet pour commencer.</p>`); 
    // Plus tard, tu pourras remplacer cette ligne par : res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. VALIDATION WEBHOOK (Pour Meta)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("✅ Webhook validé avec succès !");
        return res.status(200).send(challenge);
    } else {
        return res.sendStatus(403);
    }
});

// 3. LOGIQUE DU BOT WHATSAPP
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {
            if (body.entry && body.entry[0].changes[0].value.messages) {
                const message = body.entry[0].changes[0].value.messages[0];
                const from = message.from; // Numéro de l'utilisateur
                const phone_id = body.entry[0].changes[0].value.metadata.phone_number_id;

                // Envoi de la réponse avec ton nouveau lien
                await axios({
                    method: "POST",
                    url: `https://graph.facebook.com/v18.0/${phone_id}/messages`,
                    data: {
                        messaging_product: "whatsapp",
                        to: from,
                        type: "text",
                        text: { 
                            body: `Salut ! Prêt à gagner des spins ? 🎰\n\nClique ici pour lancer ton interface : ${GAME_URL}?user=${from}` 
                        }
                    },
                    headers: { "Authorization": `Bearer ${ACCESS_TOKEN}` }
                });
            }
            return res.sendStatus(200);
        }
    } catch (error) {
        console.error("Erreur détaillée :", error.response ? error.response.data : error.message);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));

