import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useState } from 'react';

import Home from './pages/Home';
import Alerts from './pages/Alerts';
import EventPage from './pages/EventsPage';
import ManageEventMap from './pages/ManageEvent';

import { NotificationsPage } from './pages/NotificationsPage';
import Loading from './pages/Loading';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
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

          <Route
            path="/alerts"
            element={
              <Layout>
                <Alerts />
              </Layout>
            }
          />

          <Route
            path="/notifications"
            element={
              <Layout>
                <NotificationsPage />
              </Layout>
            }
          />
          <Route
            path="/events"
            element={
              <Layout>
                <EventPage />
              </Layout>
            }
          />
          <Route
            path="/events/:id"
            element={
              <Layout>
                <ManageEventMap />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
