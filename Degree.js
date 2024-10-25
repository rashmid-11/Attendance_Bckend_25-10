
const express = require("express");
const sql = require("mssql/msnodesqlv8");
const { config } = require('./config');
const router = express.Router();


// POST /api/degrees - Create a new degree
router.post('/api/degrees', async (req, res) => {
    let { degreeName, empId, description, status, createdDate,designation } = req.body;
  
    const maxDegreeNameLength = 150; // Set based on your table definition
    if (degreeName.length > maxDegreeNameLength) {
      degreeName = degreeName.substring(0, maxDegreeNameLength); // Truncate if too long
    }
  
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Insert the new degree into the database and get the inserted ID
      const result = await sql.query`
        INSERT INTO Tbl_Degree (DegreeName, EmpID, Description, Status,Designation, CreateDate)
        OUTPUT INSERTED.ID
        VALUES (${degreeName}, ${empId}, ${description}, ${status},${designation}, ${createdDate})`;
  
      res.status(201).send({ id: result.recordset[0].ID }); // Respond with the new ID
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // router.get('/api/degrees', async (req, res) => {
  //   try {
  //     // Connect to the database
  //     await sql.connect(config);
  
  //     // Query to get degrees
  //     const result = await sql.query`
  //       SELECT 
  //         ID, 
  //         DegreeName, 
  //         EmpID, 
  //         Description, 
  //         Status, 
  //         CreateDate 
  //       FROM Tbl_Degree`;
  
  //     // Return the result as JSON
  //     res.json(result.recordset);
  //   } catch (error) {
  //     console.error('SQL error:', error);
  //     res.status(500).send('Error retrieving degrees');
  //   }
  // });
  
  router.get('/api/degree/:empID', async (req, res) => {
      const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
      console.log('Received empID:', empID); // Add this line for debugging
      if (isNaN(empID)) {
          return res.status(400).send('Invalid EmpID');
      }
      try {
          // Connect to the database
          await sql.connect(config);
      
          // Parameterized query to prevent SQL injection
          const result = await sql.query`
              SELECT * FROM Tbl_Degree WHERE EmpID = ${empID}`;
      
          res.json(result.recordset);
      } catch (error) {
          console.error('Error fetching degrees by EmpID:', error);
          res.status(500).send('Error fetching degrees');
      }
  });
  
  
      
    router.get('/api/degrees/:id', async (req, res) => {
    const degreeId = req.params.id;
  
    try {
      const result = await sql.query`
        SELECT ID, DegreeName, EmpID, Description, Status, CreateDate
        FROM Tbl_Degree
        WHERE ID = ${degreeId}`;
  
      if (result.recordset.length > 0) {
        const degreeData = result.recordset[0];
        res.json(degreeData);
      } else {
        res.status(404).json({ error: 'Degree not found' });
      }
    } catch (error) {
      console.error("Error fetching degree data:", error);
      res.status(500).json({ error: 'Failed to fetch degree data' });
    }
  });
  
  
  
  
  router.put('/api/degrees/:id', async (req, res) => {
    const { id } = req.params;
    const { degreeName, empId, description, status, updateDate } = req.body;
  
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Update the degree in the database based on the ID
      await sql.query`
        UPDATE Tbl_Degree
        SET 
          DegreeName = ${degreeName},
          EmpID = ${empId},
          Description = ${description},
          Status = ${status},
          UpdateDate = ${updateDate}
        WHERE ID = ${id}`;
  
      res.status(200).send({ message: 'Degree updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  router.put('/api/degrees/update/:id', async (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;
  
    try {
      // Assuming you're using SQL for both departments and degrees
      await sql.connect(config);
  
      const result = await sql.query`
        UPDATE Tbl_Degree 
        SET Status = ${Status} 
        WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Degree status updated successfully');
      } else {
        res.status(404).send('Degree not found');
      }
    } catch (error) {
      console.error('Error updating degree status:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  
  router.delete('/api/degrees/delete/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const result = await sql.query`
        DELETE FROM Tbl_Degree WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Degree not found' });
      }
  
      res.status(200).json({ message: 'Degree deleted successfully' });
    } catch (error) {
      console.error('Error deleting degree:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  module.exports = router;