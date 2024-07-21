const { dbConnection } = require('../db_connection');

const userController = {
    async registerUser(req, res) {
        const { userName, userPassword } = req.body;

        if (!userName || !userPassword) {
            return res.status(400).send('userName and userPassword cannot be empty');
        }

        const checkUserQuery = 'SELECT * FROM tbl_19_users WHERE userName = ?';
        const insertUserQuery = 'INSERT INTO tbl_19_users (userName, userPassword, userAccessCode) VALUES (?, ?, ?)';

        try {
            const db = await dbConnection.createConnection();
            const [results] = await db.query(checkUserQuery, [userName]);

            if (results.length > 0) {
                return res.status(400).send('UserName already exists');
            }

            let userAccessCode;
            let isUnique = false;

            while (!isUnique) {
                userAccessCode = Math.floor(100000 + Math.random() * 900000); 
                const [existingCode] = await db.query('SELECT * FROM tbl_19_users WHERE userAccessCode = ?', [userAccessCode]);

                if (existingCode.length === 0) {
                    isUnique = true;
                }
            }

            const [result] = await db.query(insertUserQuery, [userName, userPassword, userAccessCode]);
            res.status(201).send({ user_id: result.insertId, userAccessCode });
        } catch (err) {
            console.error('Error in registerUser:', err);
            res.status(500).send({ message: 'Error in registerUser', error: err.message });
        }
    },

    async loginUser(req, res) {
        const { userName, userPassword } = req.body;

        if (!userName || !userPassword) {
            return res.status(400).send('userName and userPassword cannot be empty');
        }

        const query = 'SELECT * FROM tbl_19_users WHERE userName = ? AND userPassword = ?';

        try {
            const db = await dbConnection.createConnection();
            const [results] = await db.query(query, [userName, userPassword]);

            if (results.length === 0) {
                return res.status(401).send('Invalid userName or userPassword');
            }

            res.status(200).send({ accessCode: results[0].userAccessCode });
        } catch (err) {
            console.error('Error in loginUser:', err);
            res.status(500).send({ message: 'Error in loginUser', error: err.message });
        }
    },

    async getUserDetails(req, res) {
        const { userName } = req.params;
        const query = 'SELECT * FROM tbl_19_users WHERE userName = ?';

        try {
            const db = await dbConnection.createConnection();
            const [results] = await db.query(query, [userName]);

            if (results.length === 0) {
                return res.status(404).send('User not found');
            }

            res.status(200).send(results[0]);
        } catch (err) {
            console.error('Error in getUserDetails:', err);
            res.status(500).send({ message: 'Error in getUserDetails', error: err.message });
        }
    }
};

module.exports = userController;
