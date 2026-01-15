import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MupisPage from './pages/MupisPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="mupis" element={<MupisPage />} />
      </Routes>
    </BrowserRouter>
  );
}
