import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const badges = [
  { code: 'SMOKE_FREE_7', title: '7 Days Smoke Free', description: 'You have been smoke free for a whole week!', icon: '🚭', criteria_type: 'smoke_free_days', criteria_value: 7 },
  { code: 'SMOKE_FREE_30', title: '1 Month Smoke Free', description: 'Incredible! You have been smoke free for 30 days.', icon: '🏆', criteria_type: 'smoke_free_days', criteria_value: 30 },
  { code: 'SPORT_10', title: 'Active Starter', description: 'Completed 10 sport sessions in the last 30 days.', icon: '🏃', criteria_type: 'sport_sessions', criteria_value: 10 },
  { code: 'SPORT_30', title: 'Fitness Enthusiast', description: 'Completed 30 sport sessions in the last 30 days.', icon: '🔥', criteria_type: 'sport_sessions', criteria_value: 30 },
  { code: 'STEPS_10K', title: 'Step Master', description: 'Reached 10,000 steps in a single day.', icon: '👟', criteria_type: 'step_goal', criteria_value: 10000 },
];

async function seedBadges() {
  for (const badge of badges) {
    try {
      await pool.execute(
        'INSERT IGNORE INTO badges (code, title, description, icon, criteria_type, criteria_value) VALUES (?, ?, ?, ?, ?, ?)',
        [badge.code, badge.title, badge.description, badge.icon, badge.criteria_type, badge.criteria_value]
      );
      console.log(`Seeded badge: ${badge.code}`);
    } catch (err) {
      console.error(`Error seeding ${badge.code}:`, err);
    }
  }
  console.log('Seeding completed.');
  process.exit(0);
}

seedBadges();
