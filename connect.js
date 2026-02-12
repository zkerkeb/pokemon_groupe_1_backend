import mongoose from "mongoose";

console.log("Attempting to connect to MongoDB...");

export const connectDB = async () => {
    try {
        // On utilise la variable d'environnement MONGODB_URI définie dans le fichier .env
        // dotenv est chargé dans index.js avant l'import de ce fichier
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};


connectDB();
