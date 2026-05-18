import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const setSpecificAdmin = async () => {
    try {
        console.log('Connexion à la base de données...');
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'WellMate',
        });

        // 1. Remettre tout le monde en "user"
        console.log('Rétrogradation de tous les comptes en "user"...');
        await pool.query("UPDATE users SET role = 'user'");
        
        // 2. Mettre zied@gmail.com en admin
        console.log('Recherche du compte zied@gmail.com...');
        const [result] = await pool.query("UPDATE users SET role = 'admin' WHERE email = 'zied@gmail.com'");
        
        if (result.affectedRows > 0) {
            console.log(`✅ Succès ! Le compte "zied@gmail.com" est désormais le SEUL administrateur.`);
        } else {
            console.log(`⚠️ Attention: Le compte "zied@gmail.com" n'a pas été trouvé dans la base de données.`);
            console.log(`Veuillez vous assurer que ce compte a bien été créé via la page d'inscription de l'application.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err);
        process.exit(1);
    }
};

setSpecificAdmin();
