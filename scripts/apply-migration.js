
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Connection details derived from .env.local analysis
// URL found: postgresql://postgres:Sam@#2+3#@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres
// Splitting manually to avoid URL parsing issues with special chars in password
const config = {
    user: 'postgres',
    password: 'Sam@#2+3#',
    host: 'db.gyizmixhmrfwywvafdbi.supabase.co',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
};

async function applyMigration() {
    console.log('Connecting to database...');
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('Connected.');
        
        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260214200000_products_with_stats_view.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Applying migration...');
        await client.query(sql);
        console.log('Migration successfully applied.');
        
    } catch (err) {
        console.error('Error applying migration:');
        console.error('Message:', err.message);
        console.error('Detail:', err.detail);
        console.error('Hint:', err.hint);
        console.error('Position:', err.position);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();
