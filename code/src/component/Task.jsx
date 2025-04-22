import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// פונקציה לתצוגת תאריך בעברית
const formatDateHebrew = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// מערך ברירת מחדל של מבחנים
const defaultExams = [
  {
    examName: "מבחן אמצע",
    courseName: "תכנות מונחה עצמים",
    examDate: "2025-05-10",
  },
  {
    examName: "בחינה מסכמת",
    courseName: "מבוא למערכות מידע",
    examDate: "2025-06-01",
  },
];

export default function ExamManager() {
  const [examData, setExamData] = useState({
    examName: "",
    courseName: "",
    examDate: "",
  });

  const [exams, setExams] = useState([]);

  // טען ממסד נתונים מקומי או ברירת מחדל
  useEffect(() => {
    const savedExams = localStorage.getItem("exams");
    if (savedExams) {
      setExams(JSON.parse(savedExams));
    } else {
      setExams(defaultExams);
    }
  }, []);

  const handleChange = (e) => {
    setExamData({ ...examData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();

    const { examName, courseName, examDate } = examData;

    if (!examName || !courseName || !examDate) {
      alert("אנא מלא/י את כל השדות");
      return;
    }

    const updatedExams = [...exams, examData];
    setExams(updatedExams);
    localStorage.setItem("exams", JSON.stringify(updatedExams));

    setExamData({
      examName: "",
      courseName: "",
      examDate: "",
    });

    alert("המבחן נשמר בהצלחה!");
  };

  const handleDelete = (index) => {
    const updated = [...exams];
    updated.splice(index, 1);
    setExams(updated);
    localStorage.setItem("exams", JSON.stringify(updated));
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: "auto",
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5" align="center">
        ניהול מבחנים
      </Typography>

      <TextField
        label="שם מבחן *"
        name="examName"
        value={examData.examName}
        onChange={handleChange}
        required
      />
      <TextField
        label="שם קורס *"
        name="courseName"
        value={examData.courseName}
        onChange={handleChange}
        required
      />
      <TextField
        label="תאריך מבחן *"
        name="examDate"
        type="date"
        value={examData.examDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        required
      />

      <Button variant="contained" onClick={handleSave}>
        שמור מבחן
      </Button>

      {exams.length > 0 && (
        <>
          <Divider />
          <Typography variant="h6" mt={2}>
            מבחנים שנשמרו:
          </Typography>
          {exams.map((exam, index) => (
            <Box
              key={index}
              sx={{
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 2,
                mt: 1,
                position: "relative",
              }}
            >
              <Typography>📘 שם: {exam.examName}</Typography>
              <Typography>📚 קורס: {exam.courseName}</Typography>
              <Typography>🗓️ תאריך: {formatDateHebrew(exam.examDate)}</Typography>
              <IconButton
                aria-label="delete"
                onClick={() => handleDelete(index)}
                sx={{ position: "absolute", top: 5, right: 5 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}
