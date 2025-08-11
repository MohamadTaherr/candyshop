const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

app.get('/', (req, res) => {
  res.send('Candy Shop API is running 🍭');
});

app.get('/candies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candies');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// Add a candy
app.post('/candies', async (req, res) => {
  const { name, price, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO candies (name, price, description) VALUES ($1, $2, $3) RETURNING *',
      [name, price, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a candy by id
app.put('/candies/:id', async (req, res) => {
  const id = req.params.id;
  const { name, price, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE candies SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, price, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Candy not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete a candy by id
app.delete('/candies/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM candies WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Candy not found');
    }
    res.json({ message: 'Candy deleted' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

