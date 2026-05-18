import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetToSingleAdmin = async () => {
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
        
        // 2. Trouver le tout premier utilisateur (le vôtre, logiquement) et le mettre "admin"
        console.log('Recherche du premier utilisateur pour le nommer admin...');
        const [users] = await pool.query("SELECT id, username, email FROM users ORDER BY id ASC LIMIT 1");
        
        if (users.length > 0) {
            const premierUser = users[0];
            await pool.query("UPDATE users SET role = 'admin' WHERE id = ?", [premierUser.id]);
            console.log(`✅ Succès ! Seul l'utilisateur "${premierUser.username}" (${premierUser.email}) est désormais Admin.`);
            console.log(`Tous les autres sont de simples utilisateurs.`);
        } else {
            console.log('⚠️ Aucun utilisateur trouvé dans la base de données.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err);
        process.exit(1);
    }
};

resetToSingleAdmin();
