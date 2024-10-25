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

  router.post("/api/professor", async (req, res) => {
    const { empId, firstName, middleName, lastName, email, contact, birthDate, joiningDate, namePrefix, department, education, post, isActive, designation ,attendanceId} = req.body;

    try {
        const request = pool.request();
        await request
            .input("EmpId", sql.VarChar, empId)
            .input("FirstName", sql.VarChar, firstName)
            .input("MiddleName", sql.VarChar, middleName)
            .input("LastName", sql.VarChar, lastName)
            .input("Email", sql.VarChar, email)
            .input("Phone", sql.VarChar, contact)
            .input("BirthDate", sql.Date, birthDate)
            .input("JoinDate", sql.Date, joiningDate) // use joiningDate here
            .input("Prefix", sql.VarChar, namePrefix) // use namePrefix here
            .input("Department", sql.VarChar, department)
            .input("Education", sql.VarChar, education)
            .input("Post", sql.VarChar, post)
            .input("Designation", sql.NVarChar, designation) // Corrected line for designation
            .input("Status", sql.Int, isActive ? 1 : 0) // Assuming isActive is boolean
            .input("CreatedDate", sql.DateTime, new Date())
            .input("attendanceId", sql.NVarChar, attendanceId);

        
        await request.query(`
            INSERT INTO Tbl_Professor 
            (EmpID, FirstName, MiddleName, LastName, Email, Phone, BirthDate, JoinDate, Prefix, Department, Education, Post, Status, Designation, CreateDate,AttendenceID) 
            VALUES 
            (@EmpId, @FirstName, @MiddleName, @LastName, @Email, @Phone, @BirthDate, @JoinDate, @Prefix, @Department, @Education, @Post, @Status, @Designation, @CreatedDate,@attendanceId)
        `);

        res.status(201).send({ message: "Professor created successfully." });
    } catch (error) {
        console.error("Error creating professor:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});


// GET: Get all professors
// router.get('/api/getprofessors', async (req, res) => {
//     try {
//         const pool = await sql.connect(config);
//         const result = await pool.request().query('SELECT * FROM Tbl_Professor');
//         res.json(result.recordset); // Return the records as JSON
//     } catch (error) {
//         console.error("SQL error", error);
//         res.status(500).send("Internal Server Error");
//     }
// });

router.get('/api/professors/:empID', async (req, res) => {
    const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
        if (isNaN(empID)) {
            return res.status(400).send('Invalid EmpID');
        }
     try {
            // Connect to the database
            await sql.connect(config);
    
            const result = await sql.query`
                SELECT * FROM Tbl_Professor WHERE EmpID = ${empID}`;
    
            res.json(result.recordset);
        } catch (error) {
            console.error('Error fetching departments by EmpID:', error);
            res.status(500).send('Error fetching departments');
        }
    });

// GET: Get a professor by ID
router.get('/api/getprofessor/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const request = pool.request(); 
        const result = await request
            .input("Id", sql.Int, id) 
            .query('SELECT * FROM Tbl_Professor WHERE ID = @Id'); 

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'Professor not found' });
        }

        res.json(result.recordset[0]); // Send the found professor as JSON
    } catch (error) {
        console.error("Error fetching professor:", error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// PUT: Update a professor by ID
router.put('/api/professor/:id', async (req, res) => {
  const { id } = req.params;
  const {
      empId,
      firstName,
      middleName,
      lastName,
      email,
      contact, // Corrected from phone to contact
      birthDate,
      joiningDate, // Corrected from joinDate to joiningDate
      namePrefix, // Corrected from prefix to namePrefix
      department,
      education,
      post,
      isActive // Corrected from status to isActive
  } = req.body;

  try {
      const request = pool.request();

      const result = await request
          .input("Id", sql.Int, id)
          .input("FirstName", sql.VarChar, firstName)
          .input("MiddleName", sql.VarChar, middleName)
          .input("LastName", sql.VarChar, lastName)
          .input("Email", sql.VarChar, email)
          .input("Contact", sql.VarChar, contact) // Updated input variable
          .input("BirthDate", sql.Date, birthDate)
          .input("JoiningDate", sql.Date, joiningDate) // Updated input variable
          .input("NamePrefix", sql.VarChar, namePrefix) // Updated input variable
          .input("Department", sql.VarChar, department)
          .input("Education", sql.VarChar, education) // Added education field
          .input("Post", sql.VarChar, post)
          .input("IsActive", sql.Bit, isActive) // Changed to sql.Bit for boolean
          .query(`
              UPDATE Tbl_Professor
              SET 
                  FirstName = @FirstName,
                  MiddleName = @MiddleName,
                  LastName = @LastName,
                  Email = @Email,
                  Phone = @Contact,
                  BirthDate = @BirthDate,
                  JoinDate = @JoiningDate,
                  Prefix = @NamePrefix,
                  Department = @Department,
                  Education = @Education, 
                  Post = @Post,
                  Status = @IsActive 
              WHERE ID = @Id
          `);

      if (result.rowsAffected[0] > 0) {
          res.status(200).json({ message: 'Professor updated successfully' });
      } else {
          res.status(404).json({ message: 'Professor not found' });
      }
  } catch (error) {
      console.error("Error updating professor:", error);
      res.status(500).json({ message: 'Server error' });
  }
});

router.put('/api/updateprofessorstatus/:id', async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body; // This should be a boolean value to update the status

  try {
      const request = pool.request();

      const result = await request
          .input("Id", sql.Int, id)
          .input("Status", sql.Bit, Status) // Assuming Status is a boolean (0 or 1)
          .query(`
              UPDATE Tbl_Professor
              SET 
                  Status = @Status
              WHERE ID = @Id
          `);

      if (result.rowsAffected[0] > 0) {
          res.status(200).json({ message: 'Professor status updated successfully' });
      } else {
          res.status(404).json({ message: 'Professor not found' });
      }
  } catch (error) {
      console.error("Error updating professor status:", error);
      res.status(500).json({ message: 'Server error' });
  }
});

















module.exports = router;