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


router.post('/api/timetable', async (req, res) => {
  const {
    DateDay,
    WeekDay,
    StartTime,
    EndTime,
    Subject,
    SubjectID,
    Professor,
    ProfessorID,
    Status,
    empId,
    AttendenceID,
    designation
  } = req.body;

  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // Step 1: Fetch all existing timetables for the specified weekday
    const result = await request
    .input('WeekDay', sql.VarChar, WeekDay)
    .input('DateDay', sql.Date, DateDay)
    .query(`
      SELECT StartTime, EndTime, Subject 
      FROM dbo.Tbl_Timetable
      WHERE WeekDay = @WeekDay AND DateDay = @DateDay
    `);
  

    const existingTimetables = result.recordset;

    // Step 2: Check for exact duplicates and overlapping times
    let isExactDuplicate = false;
    let isOverlap = false;

    // Function to format SQL Time objects to string 'HH:MM'
    const formatTime = (time) => {
      return time.toISOString().substring(11, 16); // Extracts 'HH:MM' from time
    };

    for (const timetable of existingTimetables) {
      const existingStartTime = formatTime(timetable.StartTime);
      const existingEndTime = formatTime(timetable.EndTime);

      console.log(`New Entry - StartTime: ${StartTime}, EndTime: ${EndTime}, Subject: ${Subject}`);
      console.log(`Existing Entry - StartTime: ${existingStartTime}, EndTime: ${existingEndTime}, Subject: ${timetable.Subject}`);

      // Check for exact duplicate (same StartTime, EndTime, and Subject)
      if (existingStartTime === StartTime &&
          existingEndTime === EndTime &&
          timetable.Subject === Subject) {
        isExactDuplicate = true;
        break;
      }

      // Check if the times overlap
      if (StartTime < existingEndTime && EndTime > existingStartTime) {
        isOverlap = true;
      }
    }

    if (isExactDuplicate) {
      console.log('Exact duplicate detected.');
      return res.status(400).json({ error: 'Exact duplicate entry found. Timetable entry already exists.' });
    }

    if (isOverlap) {
      console.log('Time slot overlaps with existing entry.');
      return res.status(400).json({ error: 'Time slot overlaps with an existing timetable entry.' });
    }

    // Step 3: Insert new timetable entry if no duplicate or overlap is found
    await request
      .input('StartTime', sql.Time, StartTime)
      .input('EndTime', sql.Time, EndTime)
      .input('Subject', sql.VarChar, Subject)
      .input('SubjectID', sql.Int, SubjectID)
      .input('Professor', sql.VarChar, Professor)
      .input('ProfessorID', sql.VarChar, ProfessorID)
      .input('AttendenceID', sql.NVarChar, AttendenceID)
      .input('Status', sql.Bit, Status)
      .input('CreatedDate', sql.DateTime, new Date())
      .input('EmpID', sql.Int, empId)
      .input('Designation', sql.VarChar, designation)
      .query(`
        INSERT INTO dbo.Tbl_Timetable 
        (DateDay, WeekDay, StartTime, EndTime, Subject, SubjectID,ProfessorID, Professor, Status, CreatedDate,EmpID,Designation,AttendenceID)
        VALUES 
        (@DateDay, @WeekDay, @StartTime, @EndTime, @Subject, @SubjectID,@ProfessorID, @Professor, @Status, @CreatedDate,@EmpID,@Designation,@AttendenceID);
      `);

    res.status(201).json({ message: 'Timetable entry created successfully.' });
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// router.post('/api/timetable', async (req, res) => {
//   const {
//     DateDay,
//     WeekDay,
//     StartTime,
//     EndTime,
//     Subject,
//     SubjectID, // Added SubjectID
//     Professor,
//     Status
//   } = req.body;
  
//   try {
//     const pool = await sql.connect(config);
//     const request = pool.request();
  
//     await request
//       .input('DateDay', sql.Date, DateDay)
//       .input('WeekDay', sql.VarChar, WeekDay)
//       .input('StartTime', sql.Time, StartTime)
//       .input('EndTime', sql.Time, EndTime)
//       .input('Subject', sql.VarChar, Subject) // Ensure this is correct
//       .input('SubjectID', sql.Int, SubjectID) // Added SubjectID
//       .input('Professor', sql.VarChar, Professor)
//       .input('Status', sql.Bit, Status)
//       .input('CreatedDate', sql.DateTime, new Date());
  
//     await request.query(`
//       INSERT INTO dbo.Tbl_Timetable (DateDay, WeekDay, StartTime, EndTime, Subject, SubjectID, Professor, Status, CreatedDate)
//       VALUES (@DateDay, @WeekDay, @StartTime, @EndTime, @Subject, @SubjectID, @Professor, @Status, @CreatedDate);
//     `);

  
//     res.status(201).json({ message: 'Timetable entry created successfully.' });
//   } catch (error) {
//     console.error('Error creating timetable:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


router.get('/api/timetable', async (req, res) => {
  try {
      const pool = await sql.connect(config); // Use your configuration here
      const result = await pool.request().query(`
          SELECT 
              ID, 
              DateDay, 
              WeekDay, 
              StartTime, 
              EndTime, 
              Subject,
              SubjectID, 
              Professor,
              ProfessorID, 
              Status, 
              CreatedDate 
          FROM 
              dbo.Tbl_Timetable
      `);

      // Check if any records were returned
      if (result.recordset.length > 0) {
          res.status(200).json(result.recordset);
      } else {
          res.status(404).json({ message: 'No timetable entries found.' });
      }
  } catch (error) {
      console.error('Error retrieving timetable:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/api/professors/subject/:SubjectID', async (req, res) => {
  const { SubjectID } = req.params;
  console.log("SubjectID received:", SubjectID);  // This should log the ID

  if (!SubjectID) {
    return res.status(400).json({ message: "SubjectID is required" });
  }

  // Proceed with the query if SubjectID is valid
  try {
    const pool = await sql.connect(config); // Your DB config
    const result = await pool.request()
      .input('SubjectID', sql.Int, SubjectID)
      .query(`
        SELECT 
          p.ID AS ProfessorID, 
          p.FirstName,   
          p.LastName,
          p.AttendenceID
        FROM 
          dbo.Tbl_Professor p
        JOIN 
          Tbl_MappingSubjectToProfesssor m ON p.ID = m.ProfID
        WHERE 
          m.SubjectID = @SubjectID AND m.SubjectStatus = 1 AND m.ProfStatus = 1
      `);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({ message: 'No professors found for this subject.' });
    }
  } catch (error) {
    console.error('Error fetching professors for subject:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/api/timetable/:empID', async (req, res) => {
  const empID = parseInt(req.params.empID); // Ensure EmpID is an integer
  console.log('Received empID:', empID); // Debugging line

  if (isNaN(empID)) {
    return res.status(400).send('Invalid EmpID');
  }

  try {
    // Connect to the database
    await sql.connect(config);

    // Parameterized query to prevent SQL injection
    const result = await sql.query`
      SELECT * FROM dbo.Tbl_Timetable WHERE EmpID = ${empID}`;
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching timetable by EmpID:', error);
    res.status(500).send('Error fetching timetable');
  }
});


router.get('/api/timetablee/:id', async (req, res) => {
  const timetableId = req.params.id; // Timetable ID
 
  console.log('Timetable ID:', timetableId); // Log received timetableId


  try {

    const result = await sql.query`
      SELECT ID, Subject, Professor, StartTime, EndTime, WeekDay,ProfessorID,SubjectID
      FROM Tbl_Timetable
      WHERE ID = ${parseInt(timetableId, 10)}`;

    if (result.recordset.length > 0) {
      const timetableData = result.recordset[0];
      res.json(timetableData);
    } else {
      res.status(404).json({ error: 'Timetable entry not found' });
    }
  } catch (error) {
    console.error("Error fetching timetable data:", error);
    res.status(500).json({ error: 'Failed to fetch timetable data' });
  }
});

router.put('/api/update/timetable/:id', async (req, res) => {
  const timetableId = req.params.id; // Timetable ID from the request parameters
  const {
    DateDay,
    WeekDay,
    StartTime,
    EndTime,
    Subject,
    SubjectID,
    Professor,
    ProfessorID,
    AttendenceID,
    Status,
    empId,
    designation,
  } = req.body;

  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // Step 1: Fetch existing timetable entry for the specified ID
    const existingResult = await request
      .input('ID', sql.Int, timetableId)
      .query(`SELECT StartTime, EndTime, Subject FROM dbo.Tbl_Timetable WHERE ID = @ID`);

    const existingTimetable = existingResult.recordset[0];

    if (!existingTimetable) {
      return res.status(404).json({ error: 'Timetable entry not found' });
    }

    // Step 2: Check for exact duplicates and overlapping times
    let isExactDuplicate = false;
    let isOverlap = false;

    // Function to format SQL Time objects to string 'HH:MM'
    const formatTime = (time) => {
      return time.toISOString().substring(11, 16); // Extracts 'HH:MM' from time
    };

    // Fetch all existing timetables for the specified weekday excluding the current entry
    const result = await request
      .input('WeekDay', sql.VarChar, WeekDay)
      .query(`SELECT StartTime, EndTime, Subject FROM dbo.Tbl_Timetable WHERE WeekDay = @WeekDay AND ID <> @ID`);

    const existingTimetables = result.recordset;

    for (const timetable of existingTimetables) {
      const existingStartTime = formatTime(timetable.StartTime);
      const existingEndTime = formatTime(timetable.EndTime);

      // Check for exact duplicate (same StartTime, EndTime, and Subject)
      if (
        existingStartTime === StartTime &&
        existingEndTime === EndTime &&
        timetable.Subject === Subject
      ) {
        isExactDuplicate = true;
        break;
      }

      // Check if the times overlap
      if (StartTime < existingEndTime && EndTime > existingStartTime) {
        isOverlap = true;
      }
    }

    if (isExactDuplicate) {
      return res.status(400).json({ error: 'Exact duplicate entry found. Timetable entry already exists.' });
    }

    if (isOverlap) {
      return res.status(400).json({ error: 'Time slot overlaps with an existing timetable entry.' });
    }

    // Step 3: Update the existing timetable entry if no duplicate or overlap is found
    await request
      .input('StartTime', sql.Time, StartTime)
      .input('EndTime', sql.Time, EndTime)
      .input('Subject', sql.VarChar, Subject)
      .input('SubjectID', sql.Int, SubjectID)
      .input('Professor', sql.VarChar, Professor)
      .input('ProfessorID', sql.VarChar, ProfessorID)
      .input('AttendenceID', sql.VarChar, AttendenceID)
      .input('Status', sql.Bit, Status)
      .input('DateDay', sql.Date, DateDay)
      .input('UpdateDate', sql.DateTime, new Date())
      .input('EmpID', sql.Int, empId)
      .input('Designation', sql.VarChar, designation)
      .input('TimetableID', sql.Int, timetableId) // Renamed parameter
      .query(`
        UPDATE dbo.Tbl_Timetable 
        SET 
          DateDay = @DateDay,
          WeekDay = @WeekDay,
          StartTime = @StartTime,
          EndTime = @EndTime,
          Subject = @Subject,
          SubjectID = @SubjectID,
          Professor = @Professor,
           ProfessorID = @ProfessorID,
          AttendenceID=@AttendenceID,
          Status = @Status,
          UpdateDate = @UpdateDate,
          EmpID = @EmpID,
          Designation = @Designation
        WHERE ID = @TimetableID;  
      `);

    res.status(200).json({ message: 'Timetable entry updated successfully.' });
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;
  