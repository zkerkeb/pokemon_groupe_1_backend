// Charger les variables d'environnement en PREMIER (avant tout autre import)
// dotenv lit le fichier .env et rend les variables accessibles via process.env
import 'dotenv/config';

import express from 'express';
import pokemon from './schema/pokemon.js';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import authMiddleware from './middleware/auth.js';
import pokemonRoutes from './routes/pokemons.js';


import './connect.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use('/assets', express.static('assets'));

app.use(express.json());

app.use((req, res, next) => {
console.log(` envoi de stats ${req.method} ${req.url}`); next(); }); // === Routes d'authentification (publiques) === // Toutes les routes définies dans routes/auth.js seront préfixées par /auth // Exemple : POST /auth/register, POST /auth/login, GET /auth/me app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});


app.use('/pokemons', pokemonRoutes);



app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});
