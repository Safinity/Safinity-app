import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import EventPage from './pages/EventsPage';
import ManageEventMap from './pages/ManageEvent';

import { NotificationsPage } from './pages/NotificationsPage'; // 1. IMPORTA AQUI
import { ThemeProvider } from 'styled-components';
import { theme } from './theme/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/events/:id" element={<ManageEventMap />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
