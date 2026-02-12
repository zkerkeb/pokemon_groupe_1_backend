/**
 * === Middleware d'authentification JWT ===
 *
 * Un middleware Express est une fonction qui s'exécute ENTRE la réception
 * de la requête et l'exécution de la route. Il peut :
 * - Modifier la requête (req) ou la réponse (res)
 * - Bloquer la requête (ne pas appeler next())
 * - Passer au middleware suivant (appeler next())
 *
 * Flux d'une requête protégée :
 *   Client → [Middleware Auth] → Route → Réponse
 *                  ↓
 *          Vérifie le token JWT
 *          Si valide → attache req.user et appelle next()
 *          Si invalide → renvoie 401 (non autorisé)
 *
 * Le client doit envoyer le token dans le header HTTP :
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */

import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // 1. Récupérer le header Authorization
    const authHeader = req.headers.authorization;

    // 2. Vérifier que le header existe et commence par "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "Accès refusé. Aucun token fourni. Envoyez le header : Authorization: Bearer <votre_token>"
        });
    }

    // req.headers.authorization = "Bearer monTOKEN"
    // 3. Extraire le token (tout ce qui suit "Bearer ")
    const token = authHeader.split(' ')[1];
    // ["Bearer", "monTOKEN"]

    try {
        // 4. Vérifier et décoder le token avec la clé secrète
        // jwt.verify() lance une erreur si le token est invalide ou expiré
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Attacher les informations de l'utilisateur à la requête
        // Cela permet aux routes suivantes d'accéder à req.user
        req.user = decoded;

        // 6. Passer au middleware/route suivant(e)
        next();
    } catch (error) {
        // Le token est invalide, expiré ou malformé
        return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
};

export default authMiddleware;
