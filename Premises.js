
////////////////////////////////////Primises////////////
// Create a new premises

const express = require("express");
const sql = require("mssql/msnodesqlv8");
const { config } = require('./config');
const router = express.Router();

router.post('/api/premises', async (req, res) => {
    const { Department, depid, classroom, classroomid, premisesName, additionalInfo, status, CreatedDate, UpdatedDate, empID, Designation } = req.body;
  
    // Validate input
    if (!Department || !depid || !classroom || !classroomid || !premisesName || !status) {
        return res.status(400).send({ error: 'Missing required fields' });
    }
  
    try {
        // Connect to the database
        await sql.connect(config);
  
        const result = await sql.query`
        INSERT INTO Tbl_Premises (Department, depid, Classroom, classroomid, PremisesName, AdditionalInfo, Status, CreatedDate, UpdatedDate, EmpID, Designation)
        OUTPUT INSERTED.ID
        VALUES (${Department}, ${depid}, ${classroom}, ${classroomid}, ${premisesName}, ${additionalInfo}, ${status}, ${CreatedDate}, ${UpdatedDate}, ${empID}, ${Designation})`;
  
        res.status(201).send({ id: result.recordset[0].ID }); // Respond with the new ID
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });
  
  
  // Get all premises
  router.get('/api/premises/:empID', async (req, res) => {
    const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
    if (isNaN(empID)) {
        return res.status(400).send('Invalid EmpID');
    }
  
    try {
        // Connect to the database
        await sql.connect(config);
  
        // Parameterized query to prevent SQL injection
        const result = await sql.query`
            SELECT * FROM Tbl_Premises WHERE EmpID = ${empID}`;
  
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching premises by EmpID:', error);
        res.status(500).send('Error fetching premises');
    }
  });
  
  // Get a specific premises by ID
  router.get('/api/onepremises/:id', async (req, res) => {
    try {
        let { id } = req.params;
        const idInt = parseInt(id, 10);
  
        if (isNaN(idInt)) {
            return res.status(400).send('Invalid ID format');
        }
  
        const result = await sql.query`SELECT * FROM Tbl_Premises WHERE ID = ${idInt}`;
        if (result.recordset.length === 0) {
            return res.status(404).send('Premises not found');
        }
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching premises:', error);
        res.status(500).send('Error fetching premises');
    }
  });
  
  router.put('/api/onepremises/:id', async (req, res) => {
    const { id } = req.params;
    const {
        Department,
        depid,
        classroom,
        classroomid,
        premisesName,
        additionalInfo,
        status,
        UpdatedDate,
    } = req.body;
  
    try {
        // Connect to the database
        await sql.connect(config);
  
        // Update the premises in the database based on the ID
        const result = await sql.query`
            UPDATE Tbl_Premises
            SET 
                Department = ${Department},
                depid = ${depid},
                Classroom = ${classroom},
                classroomid = ${classroomid},
                PremisesName = ${premisesName},
                AdditionalInfo = ${additionalInfo},
                Status = ${status},
                UpdatedDate = ${UpdatedDate}
            WHERE ID = ${id}`;
  
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send({ message: 'Premises not found' });
        }
  
        res.status(200).json({ message: 'Premises updated successfully' });
    } catch (error) {
        console.error('Error updating premises:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  router.put('/api/premises/update/status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    console.log(`Received update request for ID: ${id} with Status: ${status}`);
  
    try {
      await sql.connect(config);
  
      if (typeof status === 'undefined' || status === null) {
        return res.status(400).send('Invalid Status value');
      }
  
      const result = await sql.query`UPDATE Tbl_Premises SET Status = ${status} WHERE ID = ${id}`;
      
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Status updated successfully');
      } else {
        res.status(404).send('Premise not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating status');
    }
  });
  
  
  // Delete a premises
  router.delete('/api/premises/delete/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
        const result = await sql.query`
            DELETE FROM Tbl_Premises WHERE ID = ${id}`;
  
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Premises not found' });
        }
  
        res.status(200).json({ message: 'Premises deleted successfully' });
    } catch (error) {
        console.error('Error deleting premises:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  

  module.exports = router;
  