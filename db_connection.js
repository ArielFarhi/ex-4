const mysql = require('mysql2/promise');

let dbConnection;

exports.dbConnection = {
    async createConnection() {
        if (!dbConnection) {
            try {
                dbConnection = await mysql.createPool({
                    host : process.env.DB_HOST,
                    user : process.env.DB_USERNAME,
                    password : process.env.DB_PASSWORD,
                    database : process.env.DB_NAME,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0
                });
                console.log('Database connection pool established successfully');
            } catch (error) {
                console.error('Error establishing the database connection pool:', error);
                throw error;
            }
        }
        return dbConnection;
    }
};
