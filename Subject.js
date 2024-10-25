/////////////////////////////////////////SUBJECT/////////////////////

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

router.post('/api/subjects', async (req, res) => {
    const { subjectName, status, createdDate, empId, designation, departmentID, department, semester, semesterID } = req.body;
  
    try {
      await sql.connect(config);
      
      // Insert the new subject into the database with current time for CreatedDate
      const result = await sql.query`
        INSERT INTO Tbl_Subject (SubjectName, Status, CreateDate, EmpID, Designation, DepartmentID, Department, Semester, SemesterID)
        OUTPUT INSERTED.ID
        VALUES (${subjectName}, ${status}, GETDATE(), ${empId}, ${designation}, ${departmentID}, ${department}, ${semester}, ${semesterID})`;
  
      res.status(201).send({ id: result.recordset[0].ID });
    } catch (error) {
      console.error('Error inserting subject:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  
  // Get all Subjects
  router.get('/api/subject/:empID', async (req, res) => {
      const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
          if (isNaN(empID)) {
              return res.status(400).send('Invalid EmpID');
          }
       try {
              // Connect to the database
              await sql.connect(config);
      
              // Parameterized query to prevent SQL injection
              const result = await sql.query`
                  SELECT * FROM  Tbl_Subject WHERE EmpID = ${empID}`;
      
              res.json(result.recordset);
          } catch (error) {
              console.error('Error fetching departments by EmpID:', error);
              res.status(500).send('Error fetching departments');
          }
      });
  // Get Subject by ID
  router.get('/api/subjects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.request()
        .input('ID', sql.Int, id)
        .query('SELECT * FROM Tbl_Subject WHERE ID = @ID');
      res.status(200).json(result.recordset[0]);
    } catch (error) {
      console.error('Error fetching subject:', error);
      res.status(500).send('Error fetching subject');
    }
  });
  
  router.put('/api/subjects/:id', async (req, res) => {
    const { id } = req.params;
    const { subjectName, status, empId, designation, departmentID, department, semesterID, semester } = req.body;
  
    try {
      await sql.connect(config);
      
      // Update the subject, keeping the CreatedDate unchanged and updating the UpdatedDate
      const result = await sql.query`
        UPDATE Tbl_Subject
        SET SubjectName = ${subjectName},
            Status = ${status},
            EmpID = ${empId},
            Designation = ${designation},
            DepartmentID = ${departmentID},
            Department = ${department},
            SemesterID = ${semesterID},          
            Semester = ${semester},              
            UpdateDate = GETDATE()             
        WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Subject updated successfully');
      } else {
        res.status(404).send('Subject not found');
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  router.put('/api/subjects/update/:id', async (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;
  
    console.log(`Updating subject ID: ${id}, Status: ${Status}`); // Debugging log
  
    try {
      await sql.connect(config);
  
      const result = await sql.query`
        UPDATE Tbl_Subject 
        SET Status = ${Status} 
        WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Subject status updated successfully');
      } else {
        res.status(404).send('Subject not found');
      }
    } catch (error) {
      console.error('Error updating subject status:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Delete Subject
  router.delete('/api/subjects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.request()
        .input('ID', sql.Int, id)
        .query('DELETE FROM Tbl_Subject WHERE ID = @ID');
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).send('Error deleting subject');
    }
  });
  

//   router.post('/api/subjects/allocation', async (req, res) => {
//     const { ProfID, ProfStatus, SubjectID, SubjectStatus, Status, CreatedBy, CreatebyID } = req.body;

//     try {
      

//         // Insert statement
//         const result = await pool.request()
//             .input('ProfID', sql.Int, ProfID)
//             .input('ProfStatus', sql.Bit, ProfStatus)
//             .input('SubjectID', sql.Int, SubjectID)
//             .input('SubjectStatus', sql.Bit, SubjectStatus)
//             .input('Status', sql.Bit, Status)
//             .input('CreatedBy', sql.NVarChar(150), CreatedBy)
//             .input('CreatebyID', sql.Int, CreatebyID)
//             .query(`
//                 INSERT INTO [dbo].[Tbl_MappingSubjectToProfesssor]
//                 ([ProfID], [ProfStatus], [SubjectID], [SubjectStatus], [Status], [CreateDate], [UpdateDate], [CreatedBy], [CreatebyID])
//                 VALUES
//                 (@ProfID, @ProfStatus, @SubjectID, @SubjectStatus, @Status, GETDATE(), GETDATE(), @CreatedBy, @CreatebyID);
//             `);

//         res.status(201).json({ message: 'Allocation saved successfully', result });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to save allocation', error: err.message });
//     } finally {
//         sql.close(); // Close the connection
//     }
// });


router.post('/api/subjects/allocation', async (req, res) => {
  const { professors, SubjectID, SubjectStatus, CreatedBy, CreatebyID } = req.body; // Added SubjectStatus

  try {
      // Validate input
      if (!Array.isArray(professors) || professors.length === 0) {
          return res.status(400).json({ message: 'Invalid input: professors must be an array with at least one element' });
      }

      // Create an array to hold the SQL parameters for the batch insert
      const sqlInsertPromises = professors.map(professor => {
          return pool.request()
              .input('ProfID', sql.Int, professor.ProfID)
              .input('ProfStatus', sql.Bit, professor.ProfStatus)
              .input('SubjectID', sql.Int, SubjectID)
              .input('SubjectStatus', sql.Bit, SubjectStatus) // Reference SubjectStatus directly from req.body
              .input('Status', sql.Bit, professor.Status)
              .input('CreatedBy', sql.NVarChar(150), CreatedBy)
              .input('CreatebyID', sql.Int, CreatebyID)
              .query(`
                  INSERT INTO [dbo].[Tbl_MappingSubjectToProfesssor]
                  ([ProfID], [ProfStatus], [SubjectID], [SubjectStatus], [Status], [CreateDate], [UpdateDate], [CreatedBy], [CreatebyID])
                  VALUES
                  (@ProfID, @ProfStatus, @SubjectID, @SubjectStatus, @Status, GETDATE(), GETDATE(), @CreatedBy, @CreatebyID);
              `);
      });

      // Execute all inserts
      await Promise.all(sqlInsertPromises);

      res.status(201).json({ message: 'Allocations saved successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to save allocations', error: err.message });
  } finally {
      sql.close(); // Close the connection
  }
});


router.get('/api/subjects/allocation/:SubjectID', async (req, res) => {
  const { SubjectID } = req.params;

  try {
    const result = await pool.request()
      .input('SubjectID', sql.Int, SubjectID)
      .query(`
        SELECT 
            p.ID AS ProfID,
            p.FirstName,
            p.LastName,
            m.ProfStatus,
            m.SubjectStatus,
            m.Status
        FROM 
            Tbl_MappingSubjectToProfesssor m
        JOIN 
            Tbl_Professor p ON m.ProfID = p.ID
        WHERE 
            m.SubjectID = @SubjectID;
      `);
    
    // Return the list and whether there are assigned professors
    const assignedProfessors = result.recordset;
    const isAssigned = assignedProfessors.length > 0;

    res.status(200).json({ assignedProfessors, isAssigned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch allocations', error: err.message });
  }
});


  module.exports = router;