////////////////////////////////////////////////////Phases////////////////////////////////

const express = require("express");
const sql = require("mssql/msnodesqlv8");
const { config } = require('./config');
const router = express.Router();

router.post('/api/phases', async (req, res) => {
    const { phaseName, status, empId, designation } = req.body;
  
    try {
      await sql.connect(config);
  
      // Insert the new phase into the database with current time for CreateDate
      const result = await sql.query`
        INSERT INTO Tbl_Phase (PhaseName, Status, CreateDate, EmpID, Designation)
        OUTPUT INSERTED.ID
        VALUES (${phaseName}, ${status}, GETDATE(), ${empId}, ${designation})`;
  
      res.status(201).send({ id: result.recordset[0].ID });
    } catch (error) {
      console.error('Error inserting phase:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Get all Phases
  // router.get('/api/phases', async (req, res) => {
  //   try {
  //     const result = await sql.query('SELECT * FROM Tbl_Phase');
  //     res.status(200).json(result.recordset);
  //   } catch (error) {
  //     console.error('Error fetching phases:', error);
  //     res.status(500).send('Error fetching phases');
  //   }
  // });
  
  
  router.get('/api/phases/:empID', async (req, res) => {
      const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
          if (isNaN(empID)) {
              return res.status(400).send('Invalid EmpID');
          }
       try {
              // Connect to the database
              await sql.connect(config);
      
              // Parameterized query to prevent SQL injection
              const result = await sql.query`
                  SELECT * FROM Tbl_Phase WHERE EmpID = ${empID}`;
      
              res.json(result.recordset);
          } catch (error) {
              console.error('Error fetching departments by EmpID:', error);
              res.status(500).send('Error fetching departments');
          }
      });
  
  
  
  
  // Get Phase by ID
  router.get('/api/phases/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await sql.query`
        SELECT * FROM Tbl_Phase WHERE ID = ${id}`;
      res.status(200).json(result.recordset[0]);
    } catch (error) {
      console.error('Error fetching phase:', error);
      res.status(500).send('Error fetching phase');
    }
  });
  
  // Update Phase
  router.put('/api/phases/:id', async (req, res) => {
    const { id } = req.params;
    const { phaseName, status, empId, designation } = req.body;
  
    try {
      await sql.connect(config);
  
      // Update the phase, keeping the CreatedDate unchanged and updating the UpdatedDate
      const result = await sql.query`
        UPDATE Tbl_Phase
        SET PhaseName = ${phaseName},
            Status = ${status},
            EmpID = ${empId},
            Designation = ${designation},
            UpdateDate = GETDATE() -- Set the updated date to current time
        WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Phase updated successfully');
      } else {
        res.status(404).send('Phase not found');
      }
    } catch (error) {
      console.error('Error updating phase:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Update Phase Status
  router.put('/api/phases/update/:id', async (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;
  
    console.log(`Updating phase ID: ${id}, Status: ${Status}`); // Debugging log
  
    try {
      await sql.connect(config);
  
      const result = await sql.query`
        UPDATE Tbl_Phase 
        SET Status = ${Status} 
        WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Phase status updated successfully');
      } else {
        res.status(404).send('Phase not found');
      }
    } catch (error) {
      console.error('Error updating phase status:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Delete Phase
  router.delete('/api/phases/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await sql.query`
        DELETE FROM Tbl_Phase WHERE ID = ${id}`;
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting phase:', error);
      res.status(500).send('Error deleting phase');
    }
  });

  module.exports = router;
  