/**
 * === Modèle Utilisateur (User) ===
 *
 * Ce fichier définit le schéma Mongoose pour les utilisateurs.
 *
 * Concepts clés :
 * - Schema Mongoose : définit la structure des documents dans MongoDB
 * - Hook pre('save') : fonction exécutée automatiquement AVANT chaque sauvegarde
 * - Méthode d'instance : fonction disponible sur chaque document utilisateur
 * - Hashage : transformation irréversible du mot de passe pour le sécuriser
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// --- Définition du schéma ---
// Le schéma décrit les champs de notre collection "users" dans MongoDB
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        unique: true, // Empêche deux utilisateurs avec le même email
        lowercase: true, // Convertit automatiquement en minuscules
        trim: true, // Supprime les espaces avant/après
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: [6, 'Le mot de passe doit faire au moins 6 caractères'],
    },
    pseudo: {
        type: String,
        required: [true, 'Le pseudo est obligatoire'],
        trim: true,
    },
});

/**
 * === Hook pre('save') ===
 *
 * Ce hook s'exécute automatiquement AVANT chaque appel à .save()
 * Il permet de hasher le mot de passe avant de le stocker en base.
 *
 * Pourquoi hasher ?
 * → On ne stocke JAMAIS un mot de passe en clair dans la base de données.
 * → Le hash est irréversible : même si la BDD est compromise, les mots de passe restent protégés.
 *
 * Le "salt round" (10) détermine la complexité du hashage.
 * Plus le nombre est élevé, plus c'est sécurisé mais plus c'est lent.
 */
userSchema.pre('save', async function () {
    // On ne re-hash que si le mot de passe a été modifié (ou est nouveau)
    // Cela évite de re-hasher un hash existant lors d'une mise à jour d'email par exemple
    if (!this.isModified('password')) return next();

    // bcrypt.hash(motDePasse, saltRounds) → retourne le mot de passe hashé
    this.password = await bcrypt.hash(this.password, 10);
});

/**
 * === Méthode d'instance comparePassword ===
 *
 * Permet de vérifier si un mot de passe en clair correspond au hash stocké.
 * Utilisée lors de la connexion (login).
 *
 * Exemple d'utilisation :
 *   const isMatch = await user.comparePassword('monMotDePasse');
 *   if (isMatch) { // Connexion réussie }
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    // bcrypt.compare() compare le mot de passe en clair avec le hash
    // Retourne true si ça correspond, false sinon
    return bcrypt.compare(candidatePassword, this.password);
};

// On exporte le modèle Mongoose basé sur ce schéma
// Mongoose créera automatiquement une collection "users" dans MongoDB
export default mongoose.model('User', userSchema);
