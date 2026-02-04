
import express from 'express';
import pokemon from './schema/pokemon.js';

import './connect.js';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/pokemons', async (req, res) => {
    try {
        const pokemons = await pokemon.find({});
        res.json(pokemons);
    } catch (error) {
        res.status(500).send(error.message);
    }
});



app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});