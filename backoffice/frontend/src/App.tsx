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
import AccessibilityDeclaration from './pages/AccessibilityDeclaration';
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
              <Layout title="Home | Safinity">
                <Home />
              </Layout>
            }
          />

          <Route
            path="/alerts"
            element={
              <Layout title="Alerts | Safinity">
                <Alerts />
              </Layout>
            }
          />

          <Route
            path="/mupis"
            element={
              <Layout title="Mupis | Safinity">
                <MupisPage />
              </Layout>
            }
          />

          <Route
            path="/notifications"
            element={
              <Layout title="Notifications | Safinity">
                <NotificationsPage />
              </Layout>
            }
          />
          <Route
            path="/events"
            element={
              <Layout title="Events | Safinity">
                <EventPage />
              </Layout>
            }
          />
          <Route
            path="/manageevents"
            element={
              <Layout title="Manage Events | Safinity">
                <ManageEventMap />
              </Layout>
            }
          />
          <Route
            path="/accessibility-declaration"
            element={
              <Layout title="Accessibility Declaration | Safinity">
                <AccessibilityDeclaration />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
