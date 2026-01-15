import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useState } from 'react';

import Home from './pages/Home';
import Alerts from './pages/Alerts';
import EventPage from './pages/EventsPage';
import ManageEventMap from './pages/ManageEvent';

import { NotificationsPage } from './pages/NotificationsPage';
import Loading from './pages/Loading';
import { Layout } from './layout/Layout';
import { theme } from './theme/theme';

export default function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Loading onFinish={() => setLoading(false)} />
      </ThemeProvider>
    );
  }

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
