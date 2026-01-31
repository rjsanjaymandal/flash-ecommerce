const { Client } = require('pg');

const config = {
  user: 'postgres',
  password: 'Sam@#2+3#',
  host: 'db.gyizmixhmrfwywvafdbi.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
};

async function verifyTable() {
  const client = new Client(config);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected.');

    console.log('Checking blog_posts table...');
    const result = await client.query("SELECT count(*) FROM blog_posts");
    console.log('Table exists. Row count:', result.rows[0].count);

    console.log('Checking RLS Policies...');
    const policies = await client.query("SELECT * FROM pg_policies WHERE tablename = 'blog_posts'");
    policies.rows.forEach(p => console.log(`Policy: ${p.policyname}`));

  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    await client.end();
  }
}

verifyTable();
