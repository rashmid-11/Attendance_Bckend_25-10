////////////////////////////////////////YEAR////////////////////////////////
const express = require("express");
const sql = require("mssql/msnodesqlv8");
const { config } = require('./config');
const router = express.Router();


router.post('/api/years', async (req, res) => {
    let { yearName, empId, description, status,designation, createDate } = req.body;
  
    const maxYearNameLength = 150; // Set based on your table definition
    if (yearName.length > maxYearNameLength) {
      yearName = yearName.substring(0, maxYearNameLength); // Truncate if too long
    }
  
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Insert the new year into the database and get the inserted ID
      const result = await sql.query`
        INSERT INTO Tbl_Year (YearName, EmpID, Description, Status,Designation, CreateDate)
        OUTPUT INSERTED.ID
        VALUES (${yearName}, ${empId}, ${description}, ${status},${designation}, GETDATE())`; // Use GETDATE() for current date
  
      res.status(201).send({ id: result.recordset[0].ID }); // Respond with the new ID
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  router.get('/api/yearss/:empID', async (req, res) => {
      const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
          if (isNaN(empID)) {
              return res.status(400).send('Invalid EmpID');
          }
       try {
              // Connect to the database
              await sql.connect(config);
      
              // Parameterized query to prevent SQL injection
              const result = await sql.query`
                  SELECT * FROM   Tbl_Year WHERE EmpID = ${empID}`;
      
              res.json(result.recordset);
          } catch (error) {
              console.error('Error fetching departments by EmpID:', error);
              res.status(500).send('Error fetching departments');
          }
      });
  
  router.get('/api/years/:id', async (req, res) => {
    const yearId = req.params.id;
  
    try {
      const result = await sql.query`
        SELECT ID, YearName, EmpID, Description, Status, CreateDate
        FROM Tbl_Year
        WHERE ID = ${yearId}`;
  
      if (result.recordset.length > 0) {
        const yearData = result.recordset[0];
        res.json(yearData);
      } else {
        res.status(404).json({ error: 'Year not found' });
      }
    } catch (error) {
      console.error("Error fetching year data:", error);
      res.status(500).json({ error: 'Failed to fetch year data' });
    }
  });
  
  
  router.put('/api/years/:id', async (req, res) => {
    const { id } = req.params;
    const { yearName, empId, description, status } = req.body;
  
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Update the year in the database based on the ID
      await sql.query`
        UPDATE Tbl_Year
        SET 
          YearName = ${yearName},
          EmpID = ${empId},
          Description = ${description},
          Status = ${status},
          UpdateDate = GETDATE()
        WHERE ID = ${id}`;
  
      res.status(200).send({ message: 'Year updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  router.put('/api/years/update/:id', async (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;
  
    try {
      // Assuming you're using SQL and have a config for the database
      await sql.connect(config);
  
      const result = await sql.query`
        UPDATE Tbl_Year
        SET Status = ${Status}
        WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Year status updated successfully');
      } else {
        res.status(404).send('Year not found');
      }
    } catch (error) {
      console.error('Error updating year status:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  router.delete('/api/years/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const result = await sql.query`
        DELETE FROM Tbl_Year WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Year not found' });
      }
  
      res.status(200).json({ message: 'Year deleted successfully' });
    } catch (error) {
      console.error('Error deleting year:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  module.exports = router;
  