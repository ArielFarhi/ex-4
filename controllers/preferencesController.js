const { dbConnection } = require('../db_connection');
const destinationsData = require('../data/destinations.json');
const vacationTypesData = require('../data/vacationTypes.json');

const destinations = destinationsData.destinations;
const vacationTypes = vacationTypesData.vacationTypes;

const preferenceController = {
    async getAllPreferences(req, res) {
        try {
            const db = await dbConnection.createConnection();
            const [results] = await db.query(`SELECT * FROM tbl_19_preferences`);
            res.json(results);
        } catch (err) {
            console.error('Error fetching preferences:', err);
            res.status(500).json({ message: 'Error fetching preferences', error: err.message });
        }
    },
    async addPreference(req, res) {
        const { userAccessCode, startDate, endDate, destination, vacationType } = req.body;

        if (!destinations.includes(destination)) {
            return res.status(400).send('Invalid destination');
        }

        if (!vacationTypes.includes(vacationType)) {
            return res.status(400).send('Invalid vacation type');
        }

        try {
            const db = await dbConnection.createConnection();
            const [users] = await db.query(`SELECT id FROM tbl_19_users WHERE userAccessCode = ?`, [userAccessCode]);

            if (users.length === 0) {
                return res.status(404).send('User not found');
            }

            const userId = users[0].id;
            const [preferences] = await db.query(`SELECT * FROM tbl_19_preferences WHERE user_id = ?`, [userId]);

            if (preferences.length > 0) {
                return res.status(400).send('User already has a preference');
            }

            const [result] = await db.query(
                `INSERT INTO tbl_19_preferences (user_id, startDate, endDate, destination, vacationType) VALUES (?, ?, ?, ?, ?)`,
                [userId, startDate, endDate, destination, vacationType]
            );

            res.status(201).send({ preferences_id: result.insertId });
        } catch (err) {
            console.error('Error adding preference:', err);
            res.status(500).send({ message: 'Error adding preference', error: err.message });
        }
    },
    async updatePreference(req, res) {
        const { userAccessCode, startDate, endDate, destination, vacationType } = req.body;

        if (!destinations.includes(destination)) {
            return res.status(400).send('Invalid destination');
        }

        if (!vacationTypes.includes(vacationType)) {
            return res.status(400).send('Invalid vacation type');
        }

        try {
            const db = await dbConnection.createConnection();
            const [users] = await db.query(`SELECT id FROM tbl_19_users WHERE userAccessCode = ?`, [userAccessCode]);

            if (users.length === 0) {
                return res.status(404).send('User not found');
            }

            const userId = users[0].id;
            const [preferences] = await db.query(`SELECT * FROM tbl_19_preferences WHERE user_id = ?`, [userId]);

            if (preferences.length === 0) {
                return res.status(404).send('Preference not found');
            }

            const [result] = await db.query(
                `UPDATE tbl_19_preferences SET startDate = ?, endDate = ?, destination = ?, vacationType = ? WHERE user_id = ?`,
                [startDate, endDate, destination, vacationType, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(400).send('Failed to update preference');
            }

            res.sendStatus(204);
        } catch (err) {
            console.error('Error updating preference:', err);
            res.status(500).send({ message: 'Error updating preference', error: err.message });
        }
    },
    async getVacationResults(req, res) {
        try {
            const db = await dbConnection.createConnection();
            const [preferences] = await db.query(`SELECT * FROM tbl_19_preferences`);

            if (preferences.length < 5) {
                return res.status(404).send('Not all users have submitted their preferences');
            }

            const [destinationResult] = await db.query(`SELECT destination FROM tbl_19_preferences GROUP BY destination ORDER BY COUNT(*) DESC LIMIT 1`);
            const destination = destinationResult[0].destination;

            const [vacationTypeResult] = await db.query(`SELECT vacationType FROM tbl_19_preferences GROUP BY vacationType ORDER BY COUNT(*) DESC LIMIT 1`);
            const vacationType = vacationTypeResult[0].vacationType;

            const [startDateResult] = await db.query(`SELECT startDate FROM tbl_19_preferences ORDER BY startDate DESC LIMIT 1`);
            const startDate = startDateResult[0].startDate;

            const [endDateResult] = await db.query(`SELECT endDate FROM tbl_19_preferences ORDER BY endDate ASC LIMIT 1`);
            const endDate = endDateResult[0].endDate;

            res.json({ destination, vacationType, startDate, endDate });
        } catch (err) {
            console.error('Error getting vacation results:', err);
            res.status(500).send({ message: 'Error getting vacation results', error: err.message });
        }
    },
    async getDestinations(req, res) {
        res.json(destinations);
    },
    async getVacationTypes(req, res) {
        res.json(vacationTypes);
    }
};

module.exports = preferenceController;
