/**
 * === Routes d'authentification ===
 *
 * Ce fichier définit les routes liées à l'inscription et la connexion.
 *
 * Routes disponibles :
 * - POST /auth/register → Créer un nouveau compte
 * - POST /auth/login    → Se connecter et recevoir un token JWT
 * - GET  /auth/me       → Récupérer le profil de l'utilisateur connecté (protégée)
 *
 * Flux JWT (JSON Web Token) :
 * 1. L'utilisateur s'inscrit ou se connecte → le serveur génère un token
 * 2. Le client stocke ce token (localStorage, cookie, etc.)
 * 3. Pour chaque requête protégée, le client envoie : Authorization: Bearer <token>
 * 4. Le serveur vérifie le token et identifie l'utilisateur
 */

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../schema/user.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

/**
 * === POST /auth/register ===
 * Inscription d'un nouvel utilisateur
 *
 * Body attendu (JSON) :
 * {
 *   "email": "ash@pokemon.com",
 *   "password": "pikachu123",
 *   "pseudo": "Sacha"
 * }
 *
 * Réponse : le token JWT + les infos utilisateur
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, pseudo } = req.body;

        // Vérifier que tous les champs sont présents
        if (!email || !password || !pseudo) {
            return res.status(400).json({ message: 'Tous les champs sont requis (email, password, pseudo)' });
        }

        // Vérifier si un utilisateur avec cet email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Créer le nouvel utilisateur
        // Le mot de passe sera hashé automatiquement grâce au hook pre('save') du schéma
        const user = new User({ email, password, pseudo });
        await user.save();

        // Générer un token JWT
        // jwt.sign(payload, secret, options)
        // - payload : les données qu'on veut stocker dans le token (ici l'id et l'email)
        // - secret : la clé secrète pour signer le token
        // - expiresIn : durée de validité du token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Renvoyer le token et les infos utilisateur (sans le mot de passe !)
        res.status(201).json({
            message: 'Inscription réussie',
            token,
            user: { id: user._id, email: user.email, pseudo: user.pseudo },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * === POST /auth/login ===
 * Connexion d'un utilisateur existant
 *
 * Body attendu (JSON) :
 * {
 *   "email": "ash@pokemon.com",
 *   "password": "pikachu123"
 * }
 *
 * Réponse : le token JWT + les infos utilisateur
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier que les champs sont présents
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        // Chercher l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) {
            // On utilise un message générique pour ne pas révéler si l'email existe ou non
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe avec la méthode d'instance qu'on a définie
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Générer le token JWT (même logique que pour l'inscription)
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: { id: user._id, email: user.email, pseudo: user.pseudo },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * === GET /auth/me ===
 * Récupérer le profil de l'utilisateur connecté
 *
 * Cette route est PROTÉGÉE par le middleware authMiddleware.
 * Le middleware vérifie le token et attache req.user à la requête.
 *
 * Header requis :
 *   Authorization: Bearer <votre_token>
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // req.user contient les données décodées du token (id, email)
        // On récupère l'utilisateur complet depuis la BDD, SANS le mot de passe
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
