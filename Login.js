
//////////////////////////////////////////////////login///////////////

const express = require("express");
const sql = require("mssql/msnodesqlv8");
const { config } = require('./config');
const router = express.Router();



let pool;

// Initialize database connection
async function initializePool() {
  try {
    pool = await sql.connect(config);
    // console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

initializePool();


router.post('/api/loginadmin', async (req, res) => {
    const { email, password } = req.body;
  
    try {
        const result = await pool
            .request()
            .input('EmailID', sql.NVarChar, email)
            .input('Password', sql.NVarChar, password)
            .query('SELECT ID, EmailID, UserName, DeptName, Createby FROM [dbo].[Tbl_Admin] WHERE EmailID = @EmailID AND Password = @Password');
  
        if (result.recordset.length > 0) {
            const userData = result.recordset[0];
  
            // Store additional information in the session
            req.session.userData = {
                id: userData.ID, // Save ID instead of Vender_id
                email: userData.EmailID, // Ensure the correct casing matches your DB
                name: userData.UserName, // Ensure the correct casing matches your DB
                deptName: userData.DeptName, // Add DeptName to session
                createby: userData.Createby
            };
  
            req.session.save((err) => {
                if (err) {
                    console.error("Error saving session:", err);
                    return res.status(500).json({ error: "Failed to save session" });
                }
                // Respond with user data
                res.json({
                    success: true,
                    message: "Login successful",
                    id: userData.ID, // Return ID to the frontend
                    userEmail: userData.EmailID,
                    userName: userData.UserName,
                    deptName: userData.DeptName,
                    createby: userData.Createby
                });
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: "Failed to connect to the database" });
    }
  });
  











  router.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error clearing session:', err);
            return res.status(500).json({ message: 'Failed to log out' });
        }

        // Optionally, you can also clear the cookie on the client side
        res.clearCookie('connect.sid'); // The default cookie name for sessions in Express

        res.json({ message: 'Logout successful' });
    });
});



module.exports = router;