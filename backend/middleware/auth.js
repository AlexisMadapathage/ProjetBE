const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Charge les variables d’environnement

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Authentification requise." });
        }

        const token = authHeader.split(' ')[1];

        // Vérifie le token avec la clé secrète stockée en variable d’environnement
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = { userId: decodedToken.userId };

        next();
    } catch (error) {
        console.error("❌ Erreur d'authentification :", error.message);
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};
