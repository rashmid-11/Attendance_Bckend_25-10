
  /////////////////////////////////////////////////////Department////////////////////////

  const express = require("express");
  const sql = require("mssql/msnodesqlv8");
  const { config } = require('./config');
  const router = express.Router();

  router.post('/api/departments', async (req, res) => {
    const { departmentName, description, status, createdDate, empId, designation } = req.body;
  
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Insert the new department into the database and get the inserted ID
      const result = await sql.query`
        INSERT INTO Tbl_Department (Department, Description, Status, CreateDate, EmpID, Designation)
        OUTPUT INSERTED.ID
        VALUES (${departmentName}, ${description}, ${status}, ${createdDate}, ${empId}, ${designation})`;
  
      res.status(201).send({ id: result.recordset[0].ID }); // Now this should work correctly
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } 
  });
  

  router.put('/api/departments/:id', async (req, res) => {
    const { id } = req.params;
    const { departmentName, description, status, createdDate, empId, designation, updateDate } = req.body;
  
    console.log('UpdateDate received:', updateDate); // Log the incoming update date
  
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Update the department in the database based on the ID
      const result = await sql.query`
        UPDATE Tbl_Department
        SET 
          Department = ${departmentName},
          Description = ${description},
          Status = ${status},
          CreateDate = ${createdDate}, 
          UpdateDate = ${updateDate},    
          EmpID = ${empId},
          Designation = ${designation}
        WHERE ID = ${id}
      `;
  
      // Check if any rows were affected
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Department updated successfully');
      } else {
        res.status(404).send('Department not found'); // If no rows were affected
      }
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(500).send('Internal Server Error');
    } 
  });

  router.put('/api/departments/update/:id', async (req, res) => {
    const { id } = req.params;
    const { Status } = req.body;
  
    try {
      await sql.connect(config);
  
      const result = await sql.query`
        UPDATE Tbl_Department
        SET Status = ${Status}
        WHERE ID = ${id}`;
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).send('Status updated successfully');
      } else {
        res.status(404).send('Department not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  router.get('/api/departments/:empID', async (req, res) => {
    const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
    if (isNaN(empID)) {
        return res.status(400).send('Invalid EmpID');
    }

    try {
        // Connect to the database
        await sql.connect(config);

        // Parameterized query to prevent SQL injection
        const result = await sql.query`
            SELECT * FROM Tbl_Department WHERE EmpID = ${empID}`;

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching departments by EmpID:', error);
        res.status(500).send('Error fetching departments');
    }
});



  router.get('/api/departments/:id', async (req, res) => {
    const departmentId = req.params.id;
  
    try {
      const result = await pool.request()
        .input('department_id', sql.Int, departmentId) // Ensure this matches your database type
        .query(`
          SELECT ID, Department, Description, Status, CreateDate, EmpID, Designation
          FROM Tbl_Department
          WHERE ID = @department_id
        `);
  
      if (result.recordset.length > 0) {
        const departmentData = result.recordset[0];
        console.log("Department Data:", departmentData);
        res.json(departmentData);
      } else {
        console.log("Department not found for ID:", departmentId);
        res.status(404).json({ error: 'Department not found' });
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
      res.status(500).json({ error: 'Failed to fetch department data' });
    }
  });

  // POST /api/departments
  router.delete('/api/departments/delete/:id', async (req, res) => {
    const id = req.params.id;
    console.log('Deleting department with ID:', id);

    // Add this log
    console.log('Request body:', req.body);
  
    try {
        const query = 'DELETE FROM Tbl_Department WHERE ID = @id';
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);
  
        console.log('Rows affected:', result.rowsAffected); // Log the number of affected rows

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }
  
        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Error deleting department:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  module.exports = router;