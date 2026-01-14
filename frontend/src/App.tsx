import { ThemeProvider } from 'styled-components';
import { theme } from './theme/theme'; 
// IMPORTANTE: O caminho tem de bater certo com a tua pasta 'pages'
import { NotificationsPage } from './pages/NotificationsPage';
import './index.css'; 

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Agora o componente abaixo já está definido pelo import acima */}
      <NotificationsPage />
    </ThemeProvider>
  );
}

export default App;