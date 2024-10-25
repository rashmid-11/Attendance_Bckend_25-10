
const sql = require("mssql/msnodesqlv8");

const config = {
  user: 'lissomPresenty1', 
  password: '88xm3*rH5', 
  server: '146.88.24.73',
  database: "LissomAtteandanceDB",
};


const configEasy = {
  user: 'lissomPresenty1', 
  password: '88xm3*rH5', 
  server: '146.88.24.73',
  database: "easytime",
};

// let pool, poolEasy;

// // Initialize connection pools
// async function initializePool() {
//   try {
//     pool = await sql.connect(config);
//     console.log("Connected to LissomAtteandanceDB database!");

//     poolEasy = await sql.connect(configEasy);
//     console.log("Connected to easytime database!");
//   } catch (error) {
//     console.error("Error connecting to the databases:", error);
//   }
// }

// initializePool();

// Use appropriate pool for queries
module.exports = { config, configEasy };