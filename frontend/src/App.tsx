import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import { NotificationsPage } from './pages/NotificationsPage'; // 1. IMPORTA AQUI
import { ThemeProvider } from 'styled-components';
import { theme } from './theme/theme';
import { Layout } from './layout/Layout';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/alerts" element={<Alerts />} />

            {/* 2. ADICIONA A ROTA AQUI */}
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
