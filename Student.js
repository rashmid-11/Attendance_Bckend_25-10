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


router.post("/api/student", async (req, res) => {
    const {
        rollNo,
        prnNo,
        phase,
        degree,
        semester,
        attendanceId,
        firstName,
        middleName,
        lastName,
        contact,
        email,
        relation,
        contactNo,
        parentEmail,
        whatsappNo,
        address,
        empId,
        designation
    } = req.body;
  
    try {
        const request = pool.request();
        await request
            .input("RollNo", sql.VarChar, rollNo)
            .input("PrnNo", sql.VarChar, prnNo)
            .input("Phase", sql.VarChar, phase)
            .input("Degree", sql.VarChar, degree)
            .input("Semester", sql.VarChar, semester)
            .input("AttendanceId", sql.NVarChar, attendanceId)
            .input("FirstName", sql.VarChar, firstName)
            .input("MiddleName", sql.VarChar, middleName)
            .input("LastName", sql.VarChar, lastName)
            .input("Contact", sql.VarChar, contact)
            .input("Email", sql.VarChar, email)
            .input("Relation", sql.VarChar, relation)
            .input("ParentContactNo", sql.VarChar, contactNo)
            .input("ParentEmail", sql.VarChar, parentEmail)
            .input("WhatsappNo", sql.VarChar, whatsappNo)
            .input("ParentAddress", sql.VarChar, address)
            .input("EmpID", sql.Int, empId) 
            .input("Designation", sql.NVarChar, designation) 
            .input("CreatedDate", sql.DateTime, new Date());
        
        // Use a single query with parameters to insert the student and parent info
        const result = await request.query(`
            INSERT INTO Tbl_Student 
            (RollNumber, PNPNumber, Phase, Degree, Semester, AttendanceID, FirstName, MiddleName, LastName, Phone, Email, 
             ParentRelation, ParentContact, ParentEmail, WhatsappNo, Address, EmpID, Designation, CreateDate) 
            VALUES 
            (@RollNo, @PrnNo, @Phase, @Degree, @Semester, @AttendanceId, @FirstName, @MiddleName, @LastName, @Contact, 
             @Email, @Relation, @ParentContactNo, @ParentEmail, @WhatsappNo, @ParentAddress, @EmpID, @Designation, @CreatedDate) 
        `);
  
        res.status(201).send({ message: "Student created successfully." });
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
  });
  
  
  router.get('/api/getstudents/:empID', async (req, res) => {
    const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
    if (isNaN(empID)) {
        return res.status(400).send('Invalid EmpID');
    }
  
    try {
        // Connect to the database
        await sql.connect(config);
  
        // Parameterized query to prevent SQL injection
        const result = await sql.query`
            SELECT * FROM Tbl_Student WHERE EmpID = ${empID}`;
  
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching getstudents by EmpID:', error);
        res.status(500).send('Error fetching getstudents');
    }
  });
  
  
  router.put('/api/updatestudentstatus/:id', async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body; // This should be a boolean value to update the status
  
  try {
      const request = pool.request();
  
      const result = await request
          .input("Id", sql.Int, id)
          .input("Status", sql.Bit, Status) // Assuming Status is a boolean (0 or 1)
          .query(`
              UPDATE Tbl_Student
              SET 
                  Status = @Status
              WHERE ID = @Id
          `);
  
      if (result.rowsAffected[0] > 0) {
          res.status(200).json({ message: 'Student status updated successfully' });
      } else {
          res.status(404).json({ message: 'Student not found' });
      }
  } catch (error) {
      console.error("Error updating Student status:", error);
      res.status(500).json({ message: 'Server error' });
  }
  });
  
  router.get('/api/getstudent/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
      const request = pool.request(); 
      const result = await request
          .input("Id", sql.Int, id) 
          .query('SELECT * FROM Tbl_Student WHERE ID = @Id'); 
  
      if (result.recordset.length === 0) {
          return res.status(404).send({ message: 'student not found' });
      }
  
      res.json(result.recordset[0]); // Send the found student as JSON
  } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).send({ message: 'Internal Server Error' });
  }
  });
  
  
  router.put("/api/student/:id", async (req, res) => {
  const {
      rollNo,
      prnNo,
      phase,
      degree,
      semester,
      attendanceId,
      firstName,
      middleName,
      lastName,
      contact,
      email,
      relation,
      contactNo,
      parentEmail,
      whatsappNo,
      address
  } = req.body;
  const studentId = req.params.id;
  
  try {
      const request = pool.request();
      await request
          .input("StudentId", sql.Int, studentId)
          .input("RollNo", sql.VarChar, rollNo)
          .input("PrnNo", sql.VarChar, prnNo)
          .input("Phase", sql.VarChar, phase)
          .input("Degree", sql.VarChar, degree)
          .input("Semester", sql.VarChar, semester)
          .input("AttendanceId", sql.VarChar, attendanceId)
          .input("FirstName", sql.VarChar, firstName)
          .input("MiddleName", sql.VarChar, middleName)
          .input("LastName", sql.VarChar, lastName)
          .input("Contact", sql.VarChar, contact)
          .input("Email", sql.VarChar, email)
          .input("Relation", sql.VarChar, relation)
          .input("ParentContactNo", sql.VarChar, contactNo)
          .input("ParentEmail", sql.VarChar, parentEmail)
          .input("WhatsappNo", sql.VarChar, whatsappNo)
          .input("ParentAddress", sql.VarChar, address)
          .input("ModifiedDate", sql.DateTime, new Date());
  
      // Update student details
      const result = await request.query(`
          UPDATE Tbl_Student 
          SET 
              RollNumber = @RollNo,
              PNPNumber = @PrnNo,
              Phase = @Phase,
              Degree = @Degree,
              Semester = @Semester,
              AttendanceID = @AttendanceId,
              FirstName = @FirstName,
              MiddleName = @MiddleName,
              LastName = @LastName,
              Phone = @Contact,
              Email = @Email,
              ParentRelation = @Relation,
              ParentContact = @ParentContactNo,
              ParentEmail = @ParentEmail,
              WhatsappNo = @WhatsappNo,
              Address = @ParentAddress,
              UpdateDate = @ModifiedDate
          WHERE ID = @StudentId
      `);
  
      if (result.rowsAffected[0] === 0) {
          return res.status(404).send({ message: "Student not found." });
      }
  
      res.status(200).send({ message: "Student updated successfully." });
  } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).send({ error: "Internal Server Error" });
  }
  });
  
  

module.exports = router;