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



router.get('/api/terminal-sn', async (req, res) => {
    try {
      // Connect to the database
      await sql.connect(config);
      
      // Query to get terminal_sn
      const result = await sql.query`SELECT sn FROM easytime.easytime.iclock_terminal`;
  
      // Return the terminal_sn as a JSON response
      res.json(result.recordset);
    } catch (error) {
      console.error("SQL error:", error);
      res.status(500).send("Internal Server Error");
    } 
  });

  router.post("/api/assign-device", async (req, res) => {
    const { deviceId, classroom } = req.body; // Change to classroomName

    try {
        const request = pool.request();
        await request
            .input("DeviceId", sql.VarChar, deviceId)
            .input("ClassRoom", sql.VarChar, classroom); // Use ClassroomName

        await request.query(`
            INSERT INTO Tbl_ClassroomDevices (device_id, classroom) 
            VALUES (@DeviceId, @ClassRoom)
        `);

        res.status(201).send({ message: "Device assigned successfully." });
    } catch (error) {
        console.error("Error assigning device:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.get('/api/classroom-devices', (req, res) => {
    const query = 'SELECT * FROM Tbl_ClassroomDevices'; // Adjust query as needed
    pool.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching devices:', err);
        return res.status(500).send('Server error');
      }
      res.json(results); // Send back the results as JSON
    });
  });


  router.put('/api/classroom-devices/update/:id', (req, res) => {
    const { id } = req.params;
    const { Status } = req.body; // Expecting the new status in the body
  
    const query = 'UPDATE Tbl_ClassroomDevices SET Status = ? WHERE id= ?';
    pool.query(query, [Status, id], (err, results) => {
      if (err) {
        console.error('Error updating device status:', err);
        return res.status(500).send('Server error');
      }
      res.status(200).send('Device status updated successfully');
    });
  });


  router.get('/api/classroom-devices/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const request = `SELECT * FROM Tbl_ClassroomDevices WHERE id = @id`; // Use parameterized queries to prevent SQL injection
      const result = await pool.request()
        .input('id', sql.Int, id) // Ensure to use the correct type
        .query(request);
  
      const device = result.recordset[0]; // Assuming you get a single device
      if (device) {
        res.json(device);
      } else {
        res.status(404).json({ message: 'Device not found' });
      }
    } catch (error) {
      console.error('Error fetching device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  router.put('/api/assign-device/:deviceId', async (req, res) => {
    const { deviceId } = req.params;
    const { classroom } = req.body;
  
    try {
      const request = pool.request();
  
      const result = await request
        .input("DeviceId", sql.VarChar, deviceId)
        .input("Classroom", sql.VarChar, classroom)
        .query(`
          UPDATE Tbl_ClassroomDevices
          SET Classroom = @ClassRoom
          WHERE device_id = @DeviceId
        `);
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ message: 'Device assigned to classroom successfully' });
      } else {
        res.status(404).json({ message: 'Device not found' });
      }
    } catch (error) {
      console.error("Error assigning device:", error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  


  module.exports = router;
    





