
const express = require("express");
const sql = require("mssql/msnodesqlv8");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const fs = require("fs").promises;
const multer = require("multer");
const path = require('path');

const { config, configEasy } = require('./config');
const professorRoutes = require("./Professor");
const studentRoutes = require("./Student");
const classroomRoutes = require("./Classroom");
const yearRoutes = require("./Year");
const degreeRoutes = require("./Degree");
const phasesRoutes = require("./Phases");
const prefixRoutes = require("./Prefix");
const premisesRoutes = require("./Premises");
const semesterRoutes = require("./Semester");
const subjectRoutes = require("./Subject");
const departmentRoutes = require("./Department");
const loginRoutes = require("./Login");
const timetableRoutes = require("./Timetable");
const allreport =require('./allreport')
const device =require('./Device')
// const studentRoutes = require("./student");

const app = express();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  // origin: '',
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));
app.use(cookieParser());

app.use(session({
    secret: '31022f3ff727188735e707afc877bf06d98e32802dff2bc7baa3ced65eed7922',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 }
  }));


  let pool, poolEasy;

  // Initialize connection pools
  async function initializePool() {
    try {
      pool = await sql.connect(config);
      console.log("Connected to LissomAtteandanceDB database!");
  
      poolEasy = await sql.connect(configEasy);
      console.log("Connected to easytime database!");
    } catch (error) {
      console.error("Error connecting to the databases:", error);
    }
  }

initializePool();


app.use(professorRoutes);
app.use(studentRoutes);
app.use(classroomRoutes);
app.use(degreeRoutes);
app.use(yearRoutes);
app.use(phasesRoutes);
app.use(prefixRoutes);
app.use(premisesRoutes);
app.use(semesterRoutes);
app.use(subjectRoutes);
app.use(departmentRoutes);
app.use(loginRoutes);
app.use(timetableRoutes)
app.use(allreport)
app.use(device)



app.post('/api/upload', upload.single('file'), (req, res) => {
  res.status(200).send({ message: 'File uploaded successfully', file: req.file });
});


const port = process.env.PORT || 3009;
app.listen(port, () => console.log(`Server running on port ${port}`));
