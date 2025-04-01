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
 