const express = require("express");
const sql = require("mssql/msnodesqlv8");
const { config } = require('./config');
const router = express.Router();

router.post('/api/classrooms', async (req, res) => {
    const { classRoom, description, classCapacity, status, createdDate, empId, designation } = req.body;
  
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Insert the new classroom into the database and get the inserted ID
      const result = await sql.query`
        INSERT INTO Tbl_ClassRoom (ClassRoom, Description, ClassCapacity, Status, CreateDate, EmpID, Designation)
        OUTPUT INSERTED.ID
        VALUES (${classRoom}, ${description}, ${classCapacity}, ${status}, ${createdDate}, ${empId}, ${designation})`;
  
      res.status(201).send({ id: result.recordset[0].ID }); // Respond with the new ID
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


//   router.get('/api/classrooms', async (req, res) => {
//     try {
//       // Connect to the database
//       await sql.connect(config);
  
//       // Query to get classrooms
//       const result = await sql.query`
//         SELECT 
//           ID, 
//           ClassRoom, 
//           Description, 
//           ClassCapacity, 
//           Status, 
//           CreateDate, 
//           EmpID, 
//           Designation 
//         FROM Tbl_ClassRoom`;
  
//       // Return the result as JSON
//       res.json(result.recordset);
//     } catch (error) {
//       console.error('SQL error:', error);
//       res.status(500).send('Error retrieving classrooms');
//     }
//   });
  

router.get('/api/classrooms', async (req, res) => {
    try {
        // Connect to the database
        await sql.connect(config);

        // Retrieve the session ID from the request query or headers
        const empId = req.query.empId; // Assuming you pass it as a query parameter

        // Query to get classrooms filtered by EmpID
        const result = await sql.query`
            SELECT 
                ID, 
                ClassRoom, 
                Description, 
                ClassCapacity, 
                Status, 
                CreateDate 
            FROM Tbl_ClassRoom
            WHERE EmpID = ${empId}`; // Filter by EmpID

        // Return the result as JSON
        res.json(result.recordset);
    } catch (error) {
        console.error('SQL error:', error);
        res.status(500).send('Error retrieving classrooms');
    }
});


  router.get('/api/classrooms/:id', async (req, res) => {
    const classroomId = req.params.id;
  
    try {
      const result = await sql.query`
        SELECT ID, ClassRoom, Description, ClassCapacity, Status, CreateDate, EmpID, Designation
        FROM Tbl_ClassRoom
        WHERE ID = ${classroomId}`;
  
      if (result.recordset.length > 0) {
        const classroomData = result.recordset[0];
        res.json(classroomData);
      } else {
        res.status(404).json({ error: 'Classroom not found' });
      }
    } catch (error) {
      console.error("Error fetching classroom data:", error);
      res.status(500).json({ error: 'Failed to fetch classroom data' });
    }
  });

  router.put('/api/classrooms/:id', async (req, res) => {
    const { id } = req.params;
    const { classRoom, description, classCapacity, status, empId, designation, updateDate } = req.body;
  
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Update the classroom in the database based on the ID
      await sql.query`
        UPDATE Tbl_ClassRoom
        SET 
          ClassRoom = ${classRoom},
          Description = ${description},
          ClassCapacity = ${classCapacity},
          Status = ${status},
          UpdateDate = ${updateDate},
          EmpID = ${empId},
          Designation = ${designation}
        WHERE ID = ${id}`;
  
      res.status(200).send({ message: 'Classroom updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

// Update classroom status
router.put('/api/classrooms/update/:id', async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;

  try {
    await sql.connect(config);
    await sql.query`UPDATE Tbl_Classroom SET Status = ${Status} WHERE ID = ${id}`;
    res.status(200).send('Status updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating status');
  }
});


router.delete('/api/classrooms/delete/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const result = await sql.query`
        DELETE FROM Tbl_ClassRoom WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
  
      res.status(200).json({ message: 'Classroom deleted successfully' });
    } catch (error) {
      console.error('Error deleting classroom:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  module.exports = router;