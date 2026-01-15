import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useState } from 'react';

import Home from './pages/Home';
import MupisPage from './pages/MupisPage';
import Alerts from './pages/Alerts';
import { NotificationsPage } from './pages/NotificationsPage';
import Loading from './pages/Loading';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EventsPage from './pages/EventsPage';
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
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/alerts"
            element={
              <Layout>
                <Alerts />
              </Layout>
            }
          />
          <Route path="mupis" element={<MupisPage />} />

          <Route
            path="/notifications"
            element={
              <Layout>
                <NotificationsPage />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
