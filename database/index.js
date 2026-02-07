const { Pool } = require("pg");
require("dotenv").config();
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool;
if (process.env.NODE_ENV == "development") {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
}
else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
}

// Always export the pool itself for pgSession compatibility
module.exports = pool;

// Add a wrapper query method for debugging in development
if (process.env.NODE_ENV == "development") {
    const originalQuery = pool.query.bind(pool);
    pool.query = async function(text, params) {
        try {
            const res = await originalQuery(text, params);
            console.log("executed query", { text });
            return res;
        } catch (error) {
            console.error("error in query", { text, error: error.message });
            throw error;
        }
    };
}
