import pokemon from "../schema/pokemon.js";


export const getPokemons = async (req, res) => {

    const { page, name, type } = req.query;
    const limit = 20;

    try {
        const totalPokemons = await pokemon.countDocuments({
            'name.french': { $regex: name || '', $options: 'i' },
            'type': { $regex: type || '', $options: 'i' }
        });
        const pokemons = await pokemon.find({
            'name.french': { $regex: name || '', $options: 'i' },
            'type': { $regex: type || '', $options: 'i' }
        }).limit(limit).skip((page - 1) * limit)

        res.json({ results: pokemons, total: totalPokemons});
    } catch (error) {
        res.status(500).send(error.message);
    }
}


export const getPokemonById = async (req, res) => {
    // console.log(req)
    try {
        const poke = await pokemon.findOne({ id: req.params.id });
        if (poke) {
            res.json(poke);
        } else {
            res.status(404).send('Pokemon not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const deletePokemon = async (req, res) => {
    try {
        const result = await pokemon.deleteOne({ id: req.params.id });
        if (result.deletedCount > 0) {
            res.send('Pokemon deleted successfully');
        } else {
            res.status(404).send('Pokemon not found');
        }
    }
    catch (error) {
        res.status(500).send(error.message);
    }

}


export const updatePokemon = async (req, res) => {
    try {
        const updatedData = req.body;
        const result = await pokemon.updateOne({ id: req.params.id }, updatedData);
        if (result.modifiedCount > 0) {
            res.send('Pokemon updated successfully');
        } else {
            res.status(404).send('Pokemon not found or no changes made');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
}


export const createPokemon = async (req, res) => {
    try {
        const newPokemon = new pokemon(req.body);
        await newPokemon.save();
        res.status(201).send('Pokemon created successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
}
