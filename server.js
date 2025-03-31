const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const session = require("express-session");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Configuring file upload destination

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "EduTrack"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to database");
});

// Register endpoint
app.post("/register", (req, res) => {
    const { name, rollno, class: className, email, password } = req.body;
    const sql = "INSERT INTO users (name, rollno, class, email, password) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, rollno, className, email, password], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Registration failed");
        } else {
            res.status(200).send("Registration successful");
        }
    });
});

// Login endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Login failed");
        } else if (results.length > 0) {
            req.session.user = results[0];
            res.status(200).json({ success: true, name: results[0].name });
        } else {
            res.status(200).json({ success: false });
        }
    });
});

// Admin login endpoint
app.post("/adminLogin", (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM admin WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Login failed");
        } else if (results.length > 0) {
            res.status(200).json({ success: true });
        } else {
            res.status(200).json({ success: false });
        }
    });
});

// Logout endpoint
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send("Logout failed");
        } else {
            res.status(200).send("Logged out successfully");
        }
    });
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
}






// Endpoint to add an attendance record
app.post("/addAttendance", (req, res) => {
    const { user_id, date, status } = req.body;
    const sql = "INSERT INTO attendance (user_id, date, status) VALUES (?, ?, ?)";
    db.query(sql, [user_id, date, status], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to add attendance record");
        } else {
            res.status(200).send("Attendance record added successfully");
        }
    });
});

// Endpoint to update an attendance record
app.put("/updateAttendance/:id", (req, res) => {
    const attendanceId = req.params.id;
    const { user_id, date, status } = req.body;
    const sql = "UPDATE attendance SET user_id = ?, date = ?, status = ? WHERE id = ?";
    db.query(sql, [user_id, date, status, attendanceId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to update attendance record");
        } else {
            res.status(200).send("Attendance record updated successfully");
        }
    });
});

// Endpoint to delete an attendance record
app.delete("/deleteAttendance/:id", (req, res) => {
    const attendanceId = req.params.id;
    const sql = "DELETE FROM attendance WHERE id = ?";
    db.query(sql, [attendanceId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to delete attendance record");
        } else {
            res.status(200).send("Attendance record deleted successfully");
        }
    });
});





//
// Endpoint to fetch all attendance records
app.get("/attendance", (req, res) => {
    const sql = "SELECT * FROM attendance";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to fetch attendance records");
        } else {
            res.status(200).json(results);
        }
    });
});


// Endpoint to fetch attendance records for a specific user
app.get("/attendance/:userId", (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM attendance WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to fetch attendance records");
        } else {
            res.status(200).json(results);
        }
    });
});

app.get("/attendance/:userId", (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM attendance WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to fetch attendance records");
        } else {
            res.status(200).json(results);
        }
    });
});



// Endpoint to get the user ID from the session
app.get("/getUserId", (req, res) => {
    if (req.session.user && req.session.user.id) {
        res.status(200).json({ userId: req.session.user.id });
    } else {
        res.status(401).send("User not authenticated");
    }
});

app.get("/attendance/:userId", (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM attendance WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to fetch attendance records");
        } else {
            res.status(200).json(results);
        }
    });
});

// Serve the view attendance page
app.get("/viewAttendance", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "viewAttendance.html"));
});
// Serve admin notice upload page
app.get("/adminNotice", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "adminNotice.html"));
});

// Serve user notice viewing page
app.get("/viewNotices", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "viewNotices.html"));
});

// const path = require("path");


// Serve the user complaint page
app.get("/userComplaint", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "userComplaint.html"));
});
console.log("Serving userComplaint.html from:", path.join(__dirname, "public", "userComplaint.html"));

// Serve the check leave status page
app.get("/checkLeaveStatus", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "checkLeaveStatus.html"));
});

// Serve the admin manage attendance page
app.get("/adminAttendance", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "adminAttendance.html"));
});

// Serve the admin complaints page
app.get("/adminComplaints", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "adminComplaints.html"));
});

// Serve the admin leave applications page
app.get("/adminLeaveApplications", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "adminLeaveApplications.html"));
});

// Serve the user leave application page
app.get("/leaveApplication", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "leaveApplication.html"));
});

// Other routes
app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "home.html"));
});


// Serve the registration page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Serve the login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Serve the registration page
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Serve the admin page
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Serve the admin home page
app.get("/adminhome", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "adminhome.html"));
});

// Serve the admin manage users page
app.get("/adminmanageusers", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "adminmanageusers.html"));
});

// Serve the home page with authentication check
app.get("/home", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "home.html"));
});


// Endpoint to fetch users
app.get("/users", (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to fetch users");
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to fetch a specific user by ID
app.get("/user/:id", (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to fetch user details");
        } else if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).send("User not found");
        }
    });
});

// Endpoint to add a user
app.post("/addUser", (req, res) => {
    const { name, rollno, class: className, email, password } = req.body;
    const sql = "INSERT INTO users (name, rollno, class, email, password) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, rollno, className, email, password], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to add user");
        } else {
            res.status(200).send("User added successfully");
        }
    });
});

// Endpoint to update user details
app.put("/updateUser/:id", (req, res) => {
    const userId = req.params.id;
    const { name, rollno, class: className, email, password } = req.body;
    const sql = "UPDATE users SET name = ?, rollno = ?, class = ?, email = ?, password = ? WHERE id = ?";
    db.query(sql, [name, rollno, className, email, password, userId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to update user");
        } else {
            res.status(200).send("User updated successfully");
        }
    });
});


// Endpoint to delete a user
app.delete("/deleteUser/:id", (req, res) => {
    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to delete user");
        } else {
            res.status(200).send("User deleted successfully");
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Endpoint to handle adding complaints
app.post("/addComplaint", (req, res) => {
    const { username, user_class, description } = req.body;
    const sql = "INSERT INTO complaints (username, user_class, description) VALUES (?, ?, ?)";
    db.query(sql, [username, user_class, description], (err, result) => {
        if (err) {
            console.error("Error adding complaint:", err);
            res.status(500).send("Failed to add complaint");
        } else {
            res.status(200).send("Complaint added successfully");
        }
    });
});

// Endpoint to fetch all complaints
app.get("/complaints", (req, res) => {
    const sql = "SELECT * FROM complaints";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to fetch complaints");
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to submit a leave application
app.post("/submitLeave", (req, res) => {
    const { student_name, student_class, reason } = req.body;
    const sql = "INSERT INTO leave_applications (student_name, student_class, reason) VALUES (?, ?, ?)";
    db.query(sql, [student_name, student_class, reason], (err, result) => {
        if (err) {
            console.error("Error submitting leave application:", err);
            res.status(500).send("Failed to submit leave application");
        } else {
            res.status(200).send("Leave application submitted successfully");
        }
    });
});

// Endpoint to fetch all leave applications
app.get("/getLeaveApplications", (req, res) => {
    const sql = "SELECT * FROM leave_applications";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching leave applications:", err);
            res.status(500).send("Failed to fetch leave applications");
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to update leave application status
app.put("/updateLeaveStatus/:id", (req, res) => {
    const applicationId = req.params.id;
    const { status } = req.body;
    const sql = "UPDATE leave_applications SET status = ? WHERE id = ?";
    db.query(sql, [status, applicationId], (err, result) => {
        if (err) {
            console.error("Error updating leave application status:", err);
            res.status(500).send("Failed to update leave application status");
        } else {
            res.status(200).send("Leave application status updated successfully");
        }
    });
});

// Endpoint to fetch leave applications submitted by a specific user
app.get("/getUserLeaveApplications/:studentName", (req, res) => {
    const studentName = req.params.studentName;
    const sql = "SELECT * FROM leave_applications WHERE student_name = ?";
    db.query(sql, [studentName], (err, results) => {
        if (err) {
            console.error("Error fetching leave applications:", err);
            res.status(500).send("Failed to fetch leave applications");
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to upload a notice
app.post("/uploadNotice", upload.single("noticeImage"), (req, res) => {
    const description = req.body.description;
    const imagePath = req.file.path; // Path where the uploaded image is saved
    const sql = "INSERT INTO notices (image_path, description) VALUES (?, ?)";
    db.query(sql, [imagePath, description], (err, result) => {
        if (err) {
            console.error("Error uploading notice:", err);
            res.status(500).send("Failed to upload notice");
        } else {
            res.status(200).send("Notice uploaded successfully");
        }
    });
});

// Endpoint to fetch all notices
app.get("/getNotices", (req, res) => {
    const sql = "SELECT * FROM notices";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching notices:", err);
            res.status(500).send("Failed to fetch notices");
        } else {
            res.status(200).json(results);
        }
    });
});