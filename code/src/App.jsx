import React from 'react'
import Header from './component/Header'
import { Route, Routes } from 'react-router-dom'
import Home from './component/home'

export default function App() {
  return (
    <div>

<Header />
 <Routes>
 <Route path='/' element={<Home />} />
 
 </Routes>


    </div>
  )
}
