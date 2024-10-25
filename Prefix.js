
const express = require("express");
const sql = require("mssql/msnodesqlv8");
const { config } = require('./config');
const router = express.Router();

router.post('/api/prefixes', async (req, res) => {
    const { prefixName, empId, designation, status } = req.body;
  
    try {
        await sql.connect(config);
        const result = await sql.query`
            INSERT INTO Tbl_Prefix (PrefixName, EmpID, Designation, Status, CreateDate)
            OUTPUT INSERTED.ID
            VALUES (${prefixName}, ${empId}, ${designation}, ${status}, GETDATE())`;
        res.status(201).send({ id: result.recordset[0].ID });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });
  
  router.get('/api/prefixes/:empID', async (req, res) => {
    const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
        if (isNaN(empID)) {
            return res.status(400).send('Invalid EmpID');
        }
     try {
            // Connect to the database
            await sql.connect(config);
    
            // Parameterized query to prevent SQL injection
            const result = await sql.query`
                SELECT * FROM  Tbl_Prefix WHERE EmpID = ${empID}`;
    
            res.json(result.recordset);
        } catch (error) {
            console.error('Error fetching departments by EmpID:', error);
            res.status(500).send('Error fetching departments');
        }
    });

router.get('/api/prefixes/:id', async (req, res) => {
  const prefixId = req.params.id;

  try {
      const result = await sql.query`
          SELECT ID, PrefixName, EmpID, Designation, Status, CreateDate
          FROM Tbl_Prefix
          WHERE ID = ${prefixId}`;

      if (result.recordset.length > 0) {
          res.json(result.recordset[0]);
      } else {
          res.status(404).json({ error: 'Prefix not found' });
      }
  } catch (error) {
      console.error("Error fetching prefix data:", error);
      res.status(500).json({ error: 'Failed to fetch prefix data' });
  }
});

router.put('/api/prefixes/:id', async (req, res) => {
  const { id } = req.params;
  const { prefixName, empId, designation, status } = req.body;

  try {
      await sql.connect(config);
      await sql.query`
          UPDATE Tbl_Prefix
          SET 
              PrefixName = ${prefixName},
              EmpID = ${empId},
              Designation = ${designation},
              Status = ${status},
              UpdateDate = GETDATE()
          WHERE ID = ${id}`;

      res.status(200).send({ message: 'Prefix updated successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});


router.put('/api/prefixes/update/:id', async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;

  try {
    await sql.connect(config);

    const result = await sql.query`
      UPDATE Tbl_Prefix 
      SET Status = ${Status} 
      WHERE ID = ${id}`;

    if (result.rowsAffected[0] > 0) {
      res.status(200).send('Prefix status updated successfully');
    } else {
      res.status(404).send('Prefix not found');
    }
  } catch (error) {
    console.error('Error updating prefix status:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/api/prefixes/:id', async (req, res) => {
  const id = req.params.id;

  try {
      const result = await sql.query`
          DELETE FROM Tbl_Prefix WHERE ID = ${id}`;

      if (result.rowsAffected[0] === 0) {
          return res.status(404).json({ message: 'Prefix not found' });
      }

      res.status(200).json({ message: 'Prefix deleted successfully' });
  } catch (error) {
      console.error('Error deleting prefix:', error.message);
      res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;

