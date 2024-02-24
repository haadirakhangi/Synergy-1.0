import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage'
import Training from './Training';
import Inference from './Inference';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/train" element={<Training />} />
        <Route path="/inference" element={<Inference />} />
      </Routes>
    </Router>
  );
}

export default App;