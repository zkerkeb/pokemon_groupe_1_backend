
import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import pokemon from "../schema/pokemon.js";
import * as pokemonController from "../controllers/pokemons.js";

const router = Router();

// === Routes Pokémon GET (publiques) ===
router.get('/', pokemonController.getPokemons );

router.get('/:id', pokemonController.getPokemonById );

// === Routes Pokémon POST/PUT/DELETE (protégées) ===
// Le middleware authMiddleware est passé en 2e argument : il s'exécute AVANT le handler
// Si le token est invalide, la requête est bloquée avec une erreur 401
router.delete('/:id', authMiddleware, pokemonController.deletePokemon );


router.put('/:id', authMiddleware,  pokemonController.updatePokemon );

router.post('/', authMiddleware, pokemonController.createPokemon);















export default router;
