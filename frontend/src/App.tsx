import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useState } from 'react';

import Home from './pages/Home';
import MupisPage from './pages/MupisPage';
import Alerts from './pages/Alerts';
import EventPage from './pages/EventsPage';
import ManageEventMap from './pages/ManageEvent';

import { NotificationsPage } from './pages/NotificationsPage';
import Loading from './pages/Loading';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
// Removido o import duplicado de EventsPage
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
          {/* Rotas sem Layout (Landing/Login/Register) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas COM Layout (Menu Lateral e Superior) */}
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

          {/* CORRIGIDO: Mupis agora tem / e está dentro do Layout */}
          <Route
            path="/mupis"
            element={
              <Layout>
                <MupisPage />
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
            path="/manageevents"
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
