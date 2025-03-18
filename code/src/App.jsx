import React from 'react'
import Header from './component/Header'
import Event from './component/Event'
import { Route, Routes } from 'react-router-dom'
import Courses from './component/Courses'
import Info from './component/Info'
import StudentInfo from './component/StudentInfo'
import Task from './component/Task'
import Home from './component/Home'
export default function App() {
  return (
    <div>

<Header />
 <Routes>
 <Route path='/Home' element={<Home />} />
 <Route path='/Courses' element={<Courses/>} />
 <Route path='/Event' element={<Event />} />
 <Route path='/Header' element={<Header />} />
 <Route path='/Info' element={<Info />} />
 <Route path='/StudentInfo' element={<StudentInfo />} />
 <Route path='/Task' element={<Task />} />
 </Routes>


    </div>
  )
}
