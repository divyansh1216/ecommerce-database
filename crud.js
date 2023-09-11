const express = require('express');
const yup = require('yup');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const phoneSchema = yup.object().shape({
    name: yup.string().required(),
    brand: yup.string().required(),
    price: yup.number().positive().required(),
    features: yup.string(),
    imageurl: yup.string().url().required(),
});

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'dipu3635',
    database: 'phone_app',
});

connection.connect((error) => {
    if (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    } else {
        console.log('Connected to the database');
    }
});

// To GET all phones
app.get('/phones', (req, res) => {
    connection.query('SELECT * FROM phone_data', (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

// GET a specific phone by ID
app.get('/phones/:id', (req, res) => {
    const phoneId = req.params.id;
    connection.query('SELECT * FROM phone_data WHERE id = ?', [phoneId], (error, results) => {
        res.json(results[0]);
    });
});

app.post('/phones', async (req, res) => {
    try {
        const newPhone = req.body;
        await phoneSchema.validate(newPhone, { abortEarly: false });
        connection.query(
            'INSERT INTO phone_data (name, brand, price, features, imageurl) VALUES (?, ?, ?, ?, ?)',
            [
                newPhone.name,
                newPhone.brand,
                newPhone.price,
                newPhone.features,
                newPhone.imageurl
            ],
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Internal  error' });
                }

                newPhone.id = result.insertId;
                res.status(201).json(newPhone);
            }
        );
    } catch (error) {
        res.status(400).json({ error: error.errors });
    }
});


// PATCH (update) a phone by ID
app.patch('/phones/:id', (req, res) => {
    const phoneId = req.params.id;
    const updatedPhoneData = req.body;

    connection.query('UPDATE phone_data SET ? WHERE id = ?', [updatedPhoneData, phoneId], (error, result) => {
        if (result.affectedRows === 0) {
            return res.status(404).send('Phone not found');
        }
        res.send('Phone updated');
    });
});
// DELETE a phone by ID
app.delete('/phones/:id', (req, res) => {
    const phoneId = req.params.id;

    connection.query('DELETE FROM phone_data WHERE id = ?', [phoneId], (error, result) => {      
        if (result.affectedRows === 0) {
            return res.status(404).send('Phone not found');
        }

        res.send('Phone deleted');
    });
});

app.listen(8587);
