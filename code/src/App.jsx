import React from 'react';
import Header from './component/Header';
import Event from './component/Event';
import { Route, Routes } from 'react-router-dom';
import Info from './component/Info';
import AddStudent from './component/AddStudent';
import Task from './component/Task';
import Home from './component/home';
import Message from './component/Message';
import CourseList from './component/CourseList';
import AddCourses from './component/AddCourses';
import StudentList from './component/StudentList';

export default function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Event' element={<Event />} />
        <Route path='/Header' element={<Header />} />
        <Route path='/Info' element={<Info />} />
        <Route path='/StudentInfo' element={<AddStudent />} />
        <Route path='/students' element={<StudentList />} />
        <Route path='/Task' element={<Task />} />
        <Route path='/Message' element={<Message />} />
        <Route path='/courses' element={<CourseList />} />
        <Route path='/Add-course' element={<AddCourses />} />
        <Route path='/add-student' element={<AddStudent />} />
      </Routes>
    </div>
  );
}
