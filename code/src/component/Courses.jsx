import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

export default function CourseForm() {
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    creditPoints: "",
    semester: "",
    lecturerName: "",
    lecturerEmail: "",
  });

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.courseName || !formData.semester || !formData.lecturerName) {
      alert("אנא מלא/י את כל השדות החובה");
      return;
    }

    const updatedCourses = [...courses, formData];
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));

    alert("הקורס נשמר בהצלחה!");

    setFormData({
      courseCode: "",
      courseName: "",
      creditPoints: "",
      semester: "",
      lecturerName: "",
      lecturerEmail: "",
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSave}
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 400,
        mx: "auto",
        p: 2,
        gap: 2,
      }}
    >
      <Typography variant="h5" align="center">
הוספת קורס
</Typography>
<TextField
label="קוד קורס"
name="courseCode"
value={formData.courseCode}
onChange={handleChange}
/>
<TextField
label="שם קורס *"
name="courseName"
required
value={formData.courseName}
onChange={handleChange}
/>
<TextField
label="נקודות זכות"
name="creditPoints"
type="number"
value={formData.creditPoints}
onChange={handleChange}
/>
<TextField
label="סמסטר *"
name="semester"
required
value={formData.semester}
onChange={handleChange}
/>
<TextField
label="שם מרצה *"
name="lecturerName"
required
value={formData.lecturerName}
onChange={handleChange}
/>
<TextField
label="מייל מרצה"
name="lecturerEmail"
type="email"
value={formData.lecturerEmail}
onChange={handleChange}
/>
<Button variant="contained" type="submit">
שמור
</Button>
<Button
variant="outlined"
onClick={() => alert("מעבר לרשימת סטודנטים")}
>
מעבר לרשימת סטודנטים
</Button>
<Button
variant="outlined"
onClick={() => alert("הוספת מטלה או מבחן")}
>
הוספת מטלה או מבחן
</Button>

{courses.length > 0 && (
<Box mt={3}>
<Typography variant="h6">קורסים שנשמרו:</Typography>
{courses.map((course, index) => (
<Box
key={index}
sx={{
border: "1px solid #ccc",
borderRadius: "8px",
p: 1,
mt: 1,
}}
>
<Typography>שם קורס: {course.courseName}</Typography>
<Typography>מרצה: {course.lecturerName}</Typography>
<Typography>סמסטר: {course.semester}</Typography>
</Box>
))}
</Box>
)}
</Box>
);
}
 