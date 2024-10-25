///////////////////////////////////SEMESTER//////////////////////
const express = require("express");
const sql = require("mssql/msnodesqlv8");
const { config } = require('./config');
const router = express.Router();


router.post('/api/semesters', async (req, res) => {
    const { semesterName, yearName, empId, description,designation ,status } = req.body;
  
    try {
        await sql.connect(config);
        const result = await sql.query`
            INSERT INTO Tbl_Semester (SemesterName, YearName, EmpID, Description, Status,Designation, CreateDate)
            OUTPUT INSERTED.ID
            VALUES (${semesterName}, ${yearName}, ${empId}, ${description}, ${status},${designation} ,GETDATE())`;
        res.status(201).send({ id: result.recordset[0].ID });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });
  
  router.get('/api/semester/:empID', async (req, res) => {
      const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
          if (isNaN(empID)) {
              return res.status(400).send('Invalid EmpID');
          }
       try {
              // Connect to the database
              await sql.connect(config);
      
              // Parameterized query to prevent SQL injection
              const result = await sql.query`
                  SELECT * FROM   Tbl_Semester WHERE EmpID = ${empID}`;
      
              res.json(result.recordset);
          } catch (error) {
              console.error('Error fetching departments by EmpID:', error);
              res.status(500).send('Error fetching departments');
          }
      });
  
  
  
  router.get('/api/semesters/:id', async (req, res) => {
    const semesterId = req.params.id;
  
    try {
        const result = await sql.query`
            SELECT ID, SemesterName, YearName, EmpID, Description, Status, CreateDate
            FROM Tbl_Semester
            WHERE ID = ${semesterId}`;
  
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Semester not found' });
        }
    } catch (error) {
        console.error("Error fetching semester data:", error);
        res.status(500).json({ error: 'Failed to fetch semester data' });
    }
  });
  
  
  router.put('/api/semesters/:id', async (req, res) => {
    const { id } = req.params;
    const { semesterName, yearName, empId, description, status } = req.body;
  
    try {
        await sql.connect(config);
        await sql.query`
            UPDATE Tbl_Semester
            SET 
                SemesterName = ${semesterName},
                YearName = ${yearName},
                EmpID = ${empId},
                Description = ${description},
                Status = ${status},
                UpdateDate = GETDATE()
            WHERE ID = ${id}`;
  
        res.status(200).send({ message: 'Semester updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });
  
  // PUT API to update semester status
  router.put('/api/semesters/update/:id', async (req, res) => {
      const { id } = req.params;
      const { Status } = req.body;
    
      try {
        await sql.connect(config);
    
        const result = await sql.query`
          UPDATE Tbl_Semester 
          SET Status = ${Status} 
          WHERE ID = ${id}`;
    
        if (result.rowsAffected[0] > 0) {
          res.status(200).send('Semester status updated successfully');
        } else {
          res.status(404).send('Semester not found');
        }
      } catch (error) {
        console.error('Error updating semester status:', error);
        res.status(500).send('Internal Server Error');
      }
    });
    
  
  
  
  router.delete('/api/semesters/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
        const result = await sql.query`
            DELETE FROM Tbl_Semester WHERE ID = ${id}`;
  
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Semester not found' });
        }
  
        res.status(200).json({ message: 'Semester deleted successfully' });
    } catch (error) {
        console.error('Error deleting semester:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
  });


  module.exports = router;