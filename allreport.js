const express = require("express");
const sql = require("mssql/msnodesqlv8");
const router = express.Router();

const {  config ,configEasy } = require('./config');

router.get('/api/reports', async (req, res) => {
  try {
    await sql.connect(configEasy);
    const result =await sql.query('SELECT * FROM easytime.easytime.iclock_transaction');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Reports not found' });
    }

    res.status(200).json({ message: 'Reports retrieved successfully', data: result.recordset });
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// function getStartEndOfDay() {
//   const today = new Date();
//   const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
//   const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today
//   return { todayStart: startOfDay, todayEnd: endOfDay };
// }


// router.get('/api/timetable/today/:professorID', async (req, res) => {
//   const professorID = req.params.professorID;
//   const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

//   if (!professorID) {
//     return res.status(400).json({ message: "Professor ID is required" });
//   }

//   try {
//     const pool = await sql.connect(config);
//     const timetableResult = await pool.request()
//       .input('ProfessorID', sql.NVarChar, professorID)
//       .input('WeekDay', sql.VarChar, today)
//       .query(`
//         SELECT 
//           t.ID, 
//           t.DateDay, 
//           t.WeekDay, 
//           t.StartTime, 
//           t.EndTime, 
//           t.Subject, 
//           t.SubjectID, 
//           t.Professor, 
//           t.ProfessorID, 
//           t.Status,
//           t.AttendenceID  
//         FROM dbo.Tbl_Timetable AS t
//         WHERE t.ProfessorID = @ProfessorID AND t.WeekDay = @WeekDay
//       `);

//     if (timetableResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'No timetable entries found for today.' });
//     }

//     const attendanceID = timetableResult.recordset[0].AttendenceID;
//     console.log('Fetched Attendance ID:', attendanceID); 

//     const { todayStart, todayEnd } = getStartEndOfDay();

//     // Now querying the attendance information based on AttendenceID
//     const attendanceResult = await pool.request()
//       .input('EmployeeId', sql.NVarChar(50), attendanceID)  // Ensure attendanceID is treated as NVarChar
//       .input('TodayStart', sql.DateTime, todayStart)
//       .input('TodayEnd', sql.DateTime, todayEnd)
//       .query(`
//         SELECT MIN(CASE WHEN punch_state = '0' THEN punch_time END) AS InTime,
//                MAX(CASE WHEN punch_state = '1' THEN punch_time END) AS OutTime
//         FROM easytime.easytime.iclock_transaction
//         WHERE emp_id = @EmployeeId 
//           AND punch_time BETWEEN @TodayStart AND @TodayEnd
//       `);

//     const { InTime, OutTime } = attendanceResult.recordset[0] || { InTime: null, OutTime: null };
//     console.log('Attendance Times:', { InTime, OutTime });

//     const studentCountResult = await pool.request()
//     .input('InTime', sql.DateTime, InTime)  // Start counting after professor punches in
//     .input('OutTime', sql.DateTime, OutTime) // Stop counting when professor punches out
//     .input('ProfessorID', sql.NVarChar(50), professorID)  // Ensure professorID is passed
//     .query(`
//       SELECT COUNT(*) AS StudentCount
//       FROM easytime.easytime.iclock_transaction
//       WHERE emp_id != '0' 
//         AND emp_id != @ProfessorID  -- Exclude professor's emp_id
//         AND punch_state = '0'  -- Students punching in
//         AND punch_time > @InTime  -- After professor punches in
//         AND punch_time < @OutTime -- Before professor punches out
//     `);
  
  
//   const studentCount = studentCountResult.recordset[0]?.StudentCount || 0;
  
//     const response = {
//       timetable: timetableResult.recordset,
//       attendance: {
//         InTime,
//         OutTime
//       },
//       studentCount
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error('Error fetching today\'s timetable:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



// Function to get the start and end times of today
function getStartEndOfDay() {
  const now = new Date();
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  return { todayStart, todayEnd };
}

router.get('/api/timetable/today/:professorID', async (req, res) => {
  const professorID = req.params.professorID;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  if (!professorID) {
    return res.status(400).json({ message: "Professor ID is required" });
  }

  try {
    const pool = await sql.connect(config);
    const timetableResult = await pool.request()
      .input('ProfessorID', sql.NVarChar, professorID)
      .input('WeekDay', sql.VarChar, today)
      .query(`
        SELECT 
          t.ID, 
          t.DateDay, 
          t.WeekDay, 
          t.StartTime, 
          t.EndTime, 
          t.Subject, 
          t.SubjectID, 
          t.Professor, 
          t.ProfessorID, 
          t.Status,
          t.AttendenceID  
        FROM dbo.Tbl_Timetable AS t
        WHERE t.ProfessorID = @ProfessorID AND t.WeekDay = @WeekDay
      `);

    if (timetableResult.recordset.length === 0) {
      return res.status(404).json({ message: 'No timetable entries found for today.' });
    }

    const attendanceID = timetableResult.recordset[0].AttendenceID;
    console.log('Fetched Attendance ID:', attendanceID); 

    // Use getStartEndOfDay to get today's start and end times
    const { todayStart, todayEnd } = getStartEndOfDay();

    // Fetch punch times
    const punchTimesResult = await pool.request()
      .input('EmployeeId', sql.NVarChar(50), attendanceID)
      .input('TodayStart', sql.DateTime, todayStart)
      .input('TodayEnd', sql.DateTime, todayEnd)
      .query(`
        SELECT punch_time
        FROM easytime.easytime.iclock_transaction
        WHERE emp_id = @EmployeeId 
          AND punch_time BETWEEN @TodayStart AND @TodayEnd
        ORDER BY punch_time
      `);

    const punchTimes = punchTimesResult.recordset.map(record => record.punch_time);
    let inTime = null;
    let outTime = null;

    if (punchTimes.length > 0) {
      inTime = punchTimes[0]; // First punch is In
      if (punchTimes.length > 1) {
        outTime = punchTimes[punchTimes.length - 1]; // Last punch is Out
      }
    }

    console.log('Attendance Times:', { inTime, outTime });

    // Query student count based on attendance times
    const studentCountResult = await pool.request()
    .input('InTime', sql.DateTime, inTime)
    .input('OutTime', sql.DateTime, outTime)
    .input('ProfessorID', sql.NVarChar(50), professorID)
    .query(`
      SELECT COUNT(DISTINCT emp_id) AS StudentCount
      FROM easytime.easytime.iclock_transaction
      WHERE emp_id != '0' 
        AND emp_id != @ProfessorID  -- Exclude professor's emp_id
        AND punch_time > @InTime
        AND punch_time < @OutTime
    `);
  

    const studentCount = studentCountResult.recordset[0]?.StudentCount || 0;

    const response = {
      timetable: timetableResult.recordset,
      attendance: {
        InTime: inTime,
        OutTime: outTime
      },
      studentCount
    };
    console.log(studentCount)

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching today\'s timetable:', error);
   
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// router.get('/api/timetablestud/today/:professorID', async (req, res) => {
//   const professorID = req.params.professorID;
//   const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

//   if (!professorID) {
//     return res.status(400).json({ message: "Professor ID is required" });
//   }

//   try {
//     const pool = await sql.connect(config);
//     const timetableResult = await pool.request()
//       .input('ProfessorID', sql.NVarChar, professorID)
//       .input('WeekDay', sql.VarChar, today)
//       .query(`
//         SELECT 
//           t.ID, 
//           t.DateDay, 
//           t.WeekDay, 
//           t.StartTime, 
//           t.EndTime, 
//           t.Subject, 
//           t.SubjectID, 
//           t.Professor, 
//           t.ProfessorID, 
//           t.Status,
//           t.AttendenceID  
//         FROM dbo.Tbl_Timetable AS t
//         WHERE t.ProfessorID = @ProfessorID AND t.WeekDay = @WeekDay
//       `);

//     if (timetableResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'No timetable entries found for today.' });
//     }

//     const attendanceID = timetableResult.recordset[0].AttendenceID;
//     console.log('Fetched Attendance ID:', attendanceID); 

//     // Use getStartEndOfDay to get today's start and end times
//     const { todayStart, todayEnd } = getStartEndOfDay();

//     // Fetch punch times
//     const punchTimesResult = await pool.request()
//       .input('EmployeeId', sql.NVarChar(50), attendanceID)
//       .input('TodayStart', sql.DateTime, todayStart)
//       .input('TodayEnd', sql.DateTime, todayEnd)
//       .query(`
//         SELECT punch_time
//         FROM easytime.easytime.iclock_transaction
//         WHERE emp_id = @EmployeeId 
//           AND punch_time BETWEEN @TodayStart AND @TodayEnd
//         ORDER BY punch_time
//       `);

//     const punchTimes = punchTimesResult.recordset.map(record => record.punch_time);
//     let inTime = null;
//     let outTime = null;

//     if (punchTimes.length > 0) {
//       inTime = punchTimes[0]; // First punch is In
//       if (punchTimes.length > 1) {
//         outTime = punchTimes[punchTimes.length - 1]; // Last punch is Out
//       }
//     }

//     console.log('Attendance Times:', { inTime, outTime });

//     // Query student names based on attendance times
//     const studentDetailsResult = await pool.request()
//       .input('InTime', sql.DateTime, inTime)
//       .input('OutTime', sql.DateTime, outTime)
//       .input('ProfessorID', sql.NVarChar(50), professorID)
//       .query(`
//         SELECT  s.FirstName, s.LastName
//         FROM easytime.easytime.iclock_transaction AS t
//         JOIN dbo.Tbl_Student AS s ON t.emp_id = s.AttendanceID
//         WHERE t.emp_id != '0' 
//           AND t.emp_id != @ProfessorID  -- Exclude professor's emp_id
//           AND t.punch_time > @InTime
//           AND t.punch_time < @OutTime
//       `);

//     const students = studentDetailsResult.recordset;

//     const response = {
//       timetable: timetableResult.recordset,
//       attendance: {
//         InTime: inTime,
//         OutTime: outTime
//       },
//       students // List of students with FirstName and LastName
//     };

//     console.log('Student Details:', students);

//     res.status(200).json(response);
//   } catch (error) {
//     console.error('Error fetching today\'s timetable:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



router.get('/api/timetablestud/today/:professorID', async (req, res) => {
  const professorID = req.params.professorID;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  if (!professorID) {
    return res.status(400).json({ message: "Professor ID is required" });
  }

  try {
    const pool = await sql.connect(config);
    const timetableResult = await pool.request()
      .input('ProfessorID', sql.NVarChar, professorID)
      .input('WeekDay', sql.VarChar, today)
      .query(`
        SELECT 
          t.ID, 
          t.DateDay, 
          t.WeekDay, 
          t.StartTime, 
          t.EndTime, 
          t.Subject, 
          t.SubjectID, 
          t.Professor, 
          t.ProfessorID, 
          t.Status,
          t.AttendenceID  
        FROM dbo.Tbl_Timetable AS t
        WHERE t.ProfessorID = @ProfessorID AND t.WeekDay = @WeekDay
      `);

    if (timetableResult.recordset.length === 0) {
      return res.status(404).json({ message: 'No timetable entries found for today.' });
    }

    const attendanceID = timetableResult.recordset[0].AttendenceID;
    console.log('Fetched Attendance ID:', attendanceID); 

    // Use getStartEndOfDay to get today's start and end times
    const { todayStart, todayEnd } = getStartEndOfDay();

    // Fetch punch times
    const punchTimesResult = await pool.request()
      .input('EmployeeId', sql.NVarChar(50), attendanceID)
      .input('TodayStart', sql.DateTime, todayStart)
      .input('TodayEnd', sql.DateTime, todayEnd)
      .query(`
        SELECT punch_time
        FROM easytime.easytime.iclock_transaction
        WHERE emp_id = @EmployeeId 
          AND punch_time BETWEEN @TodayStart AND @TodayEnd
        ORDER BY punch_time
      `);

    const punchTimes = punchTimesResult.recordset.map(record => record.punch_time);
    let inTime = null;
    let outTime = null;

    if (punchTimes.length > 0) {
      inTime = punchTimes[0]; // First punch is In
      if (punchTimes.length > 1) {
        outTime = punchTimes[punchTimes.length - 1]; // Last punch is Out
      }
    }

    console.log('Attendance Times:', { inTime, outTime });

    // Query distinct student names based on attendance times
    const studentDetailsResult = await pool.request()
    .input('InTime', sql.DateTime, inTime)
    .input('OutTime', sql.DateTime, outTime)
    .input('ProfessorID', sql.NVarChar(50), professorID)
    .query(`
      WITH RankedPunches AS (
        SELECT 
          s.FirstName, 
          s.LastName, 
          t.punch_time, 
          t.emp_id,
          ROW_NUMBER() OVER (PARTITION BY t.emp_id ORDER BY t.punch_time DESC) AS row_num
        FROM easytime.easytime.iclock_transaction AS t
        JOIN dbo.Tbl_Student AS s ON t.emp_id = s.AttendanceID
        WHERE t.emp_id != '0' 
          AND t.emp_id != @ProfessorID  -- Exclude professor's emp_id
          AND t.punch_time > @InTime
          AND t.punch_time < @OutTime
      )
      SELECT FirstName, LastName, punch_time
      FROM RankedPunches
      WHERE row_num = 1;  -- Only get the latest punch_time per emp_id
    `);
  
  const students = studentDetailsResult.recordset;
  
    const response = {
      timetable: timetableResult.recordset,
      attendance: {
        InTime: inTime,
        OutTime: outTime
      },
      students // List of students with FirstName and LastName
    };

    console.log('Student Details:', students);

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching today\'s timetable:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




  module.exports = router;