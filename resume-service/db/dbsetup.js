const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createTable = async () => {
  const client = await pool.connect();
  try {
    const queryText = `
            CREATE TABLE IF NOT EXISTS resumes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                job_title VARCHAR(255) NOT NULL,
                job_description TEXT NOT NULL,
                job_company VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
    await client.query(queryText);
    console.log("Resumes table is ready.");

    const createNameIndexQuery = `
        CREATE INDEX IF NOT EXISTS idx_resumes_name ON resumes(name);
    `;
    await client.query(createNameIndexQuery);
    console.log("Index on name created successfully.");

    const createTimestampsTableQuery = `
      CREATE TABLE IF NOT EXISTS resume_timestamps (
          id SERIAL PRIMARY KEY,
          resume_id INT NOT NULL,
          time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
      );
    `;
    await client.query(createTimestampsTableQuery);
    console.log("resume_timestamps table created successfully.");
  } catch (err) {
    console.error("Error creating table", err);
  } finally {
    client.release();
  }
};

module.exports = { pool, createTable };
