import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
