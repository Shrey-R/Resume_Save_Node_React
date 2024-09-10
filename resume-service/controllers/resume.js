const { pool } = require('../db/dbsetup');
const { addToCache, getFromCache } = require('../redis/redisClient');
const { resumeSchema } = require('../validation/resumeSchema');

const uploadResumeDetails = async (req, res) => {
    const { name, job_title, job_description, job_company } = req.body;

    const { error } = resumeSchema.validate({ name, job_title, job_description, job_company });
    if (error) {
        return res.status(422).json({ error : error.details[0].message});
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            'INSERT INTO resumes (name, job_title, job_description, job_company) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, job_title, job_description, job_company]
        );

        const resumeId = result.rows[0].id;

        await client.query(
            'INSERT INTO resume_timestamps (resume_id, time) VALUES ($1, CURRENT_TIMESTAMP)',
            [resumeId]
        );

        await client.query('COMMIT');
        res.status(200).json({ resumeId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error inserting resume or timestamp:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    } finally {
        client.release();
    }
};


const getResumeById = async (req, res) => {
    const { id } = req.params;
    try {

        let data = await getFromCache(id);
        if (data) {
            console.log('Cache hit');
            return res.status(200).json([data]);
        }
        console.log('Cache miss, fetching from DB');

        const result = await pool.query('SELECT * FROM resumes WHERE id = $1', [id]);

        if (result.rows.length > 0) {
            data = result.rows[0];
            await addToCache(id, data);
            return res.status(200).json(result.rows);
        } else {
            return res.status(404).json({ error: 'Resume not found' });
        }

    } catch (err) {
        console.error('Error retrieving resume by ID:', err);
        return res.status(500).json({ error: 'Database query failed' });
    }
}

const getResumeByName = async (req, res) => {
    const { name } = req.params;
    
    const cacheKey = `name:${name.toLowerCase()}`;

    try {
        let data = await getFromCache(cacheKey);
        if (data) {
            console.log('Cache hit');
            return res.status(200).json(data);
        }

        console.log('Cache miss, fetching from DB');
        const nameParts = name.split('+');

        if (nameParts.length !== 2) {
            return res.status(400).json({ error: 'Invalid name format. Please provide both first and last name.' });
        }

        const [firstName, lastName] = nameParts;

        const resultExact = await pool.query(
            'SELECT * FROM resumes WHERE name ILIKE $1',
            [`${firstName} ${lastName}`]
        );

        const resultPartial = resultExact.rows.length === 0 ? await pool.query(
            'SELECT * FROM resumes WHERE name ILIKE $1 OR name ILIKE $2',
            [`${firstName}%`, `%${lastName}`]
        ) : null;

        data = resultExact.rows.length > 0 ? resultExact.rows : (resultPartial && resultPartial.rows.length > 0 ? resultPartial.rows : []);

        if (data.length > 0) {
            await addToCache(cacheKey, data);

            return res.status(200).json(data);
        } else {
            return res.status(404).json({ error: 'No matching resumes found' });
        }
    } catch (err) {
        console.error('Error retrieving resume by name:', err);
        return res.status(500).json({ error: 'Database query failed' });
    }
};



module.exports = {
    uploadResumeDetails,
    getResumeById,
    getResumeByName
}