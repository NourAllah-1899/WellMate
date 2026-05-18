import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const createDedicatedAdmin = async () => {
    try {
        console.log('Connexion à la base de données...');
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'WellMate',
        });

        // 1. Remettre TOUT le monde en "user" (y compris zied@gmail.com)
        console.log('Rétrogradation de tous les comptes actuels en simples utilisateurs...');
        await pool.query("UPDATE users SET role = 'user'");
        
        // 2. Créer ou mettre à jour le compte admin dédié
        const adminEmail = 'admin@wellmate.com';
        const adminUsername = 'AdminSystem';
        const adminPassword = 'Admin@123'; // Mot de passe par défaut
        
        // Vérifier si l'admin existe déjà
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
        
        if (existing.length > 0) {
            console.log('Le compte admin existe déjà. Mise à jour de son rôle...');
            await pool.query("UPDATE users SET role = 'admin' WHERE email = ?", [adminEmail]);
        } else {
            console.log('Création du nouveau compte administrateur dédié...');
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            await pool.query(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')",
                [adminUsername, adminEmail, hashedPassword]
            );
        }

        console.log('\n✅ SUCCÈS ! LA BASE DE DONNÉES EST PRÊTE.');
        console.log('----------------------------------------------------');
        console.log('Les identifiants de votre NOUVEAU compte Admin sont :');
        console.log(`Email : ${adminEmail}`);
        console.log(`Mot de passe : ${adminPassword}`);
        console.log('----------------------------------------------------');
        console.log(`Votre compte zied@gmail.com est redevenu un simple utilisateur.\n`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err);
        process.exit(1);
    }
};

createDedicatedAdmin();
