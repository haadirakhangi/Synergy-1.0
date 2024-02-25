//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import LandingPage from './LandingPage'

import Home from './pages/Home'
import Assistant from './pages/Assistant';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Pagenotfound from './pages/Pagenotfound';
//import Layout from './components/Layout/Layout';

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
      <div>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/upload' element={<Upload/>} />
            <Route path='/assistant' element={<Assistant/>} />
            <Route path='/dashboard' element={<Dashboard/>} />
            <Route path='*' element={<Pagenotfound/>} />
          </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;