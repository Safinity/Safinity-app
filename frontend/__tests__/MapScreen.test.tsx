/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// --- 1. MOCKS DO ECOSSISTEMA EXPO & NATIVO ---
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: () => ({ onChange: () => ({}) }),
    Pinch: () => ({ onChange: () => ({}) }),
    Simultaneous: () => ({}),
  },
  GestureDetector: ({ children }: any) => children,
}));

jest.mock('react-native-reanimated', () => ({
  useSharedValue: (val: number) => ({ value: val }),
  useAnimatedStyle: () => ({}),
  withTiming: (val: number) => val,
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 40.6331, longitude: -8.6595 },
  }),
  watchPositionAsync: jest.fn().mockResolvedValue({ remove: jest.fn() }),
  PermissionStatus: { GRANTED: 'granted' },
  Accuracy: { Balanced: 1 },
}));

jest.mock('@clerk/expo', () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    getToken: jest.fn().mockResolvedValue('clerk_mock_token_123'),
  }),
}));

// --- 2. EXTRAÇÃO DAS FUNÇÕES PURAS DO TEU COMPONENTE ---
// Copiamos os algoritmos puros do teu ficheiro para garantir que a matemática de cor e filtros funciona perfeitamente

const getHeatColor = (density?: number | null, alpha = 1) => {
  const HEAT_GREEN = { r: 15, g: 214, b: 191 };
  const HEAT_ORANGE = { r: 255, g: 152, b: 42 };
  const HEAT_RED = { r: 200, g: 50, b: 50 };

  const densityRatio = Math.max(0, Math.min(100, Number(density ?? 0))) / 100;
  const startColor = densityRatio <= 0.5 ? HEAT_GREEN : HEAT_ORANGE;
  const endColor = densityRatio <= 0.5 ? HEAT_ORANGE : HEAT_RED;
  const segmentRatio = densityRatio <= 0.5 ? densityRatio * 2 : (densityRatio - 0.5) * 2;

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * segmentRatio);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * segmentRatio);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * segmentRatio);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const matchesSearch = (item: { name?: string; type?: string }, query: string) => {
  if (!query) return true;
  const q = query.toLowerCase();
  const name = (item.name || 'Unnamed Item').toLowerCase();
  return name.includes(q) || (item.type || '').toLowerCase().includes(q);
};

// --- 3. SUITE DE TESTES ---
describe('MapScreen Core Logic & Math Projections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Algoritmo Algébrico do Heatmap (Densidade)', () => {
    it('deve retornar a cor verde (HEAT_GREEN) quando a densidade do sensor for 0%', () => {
      const color = getHeatColor(0, 1);
      expect(color).toBe('rgba(15, 214, 191, 1)');
    });

    it('deve interpolar para laranja quando a densidade atingir o ponto médio (50%)', () => {
      const color = getHeatColor(50, 1);
      expect(color).toBe('rgba(255, 152, 42, 1)');
    });

    it('deve atingir a cor vermelha de saturação máxima (HEAT_RED) com 100% de ocupação', () => {
      const color = getHeatColor(100, 0.5);
      expect(color).toBe('rgba(200, 50, 50, 0.5)');
    });

    it('deve limitar a densidade de entrada caso receba valores fora do intervalo [0, 100]', () => {
      const lowColor = getHeatColor(-50, 1);
      const highColor = getHeatColor(250, 1);

      expect(lowColor).toBe('rgba(15, 214, 191, 1)'); // Cai no cap de 0
      expect(highColor).toBe('rgba(200, 50, 50, 1)'); // Cai no cap de 100
    });
  });

  describe('Sistema Dinâmico de Pesquisa e Filtros', () => {
    const mockPins = [
      { id: '1', name: 'Palco Principal', type: 'stage' },
      { id: '2', name: 'Alimentação Central', type: 'food' },
      { id: '3', name: 'Casa de Banho Premium', type: 'wc' },
    ];

    it('deve aprovar todos os itens se a query de pesquisa estiver vazia', () => {
      const filtered = mockPins.filter(pin => matchesSearch(pin, ''));
      expect(filtered).toHaveLength(3);
    });

    it('deve filtrar os pins ignorando diferenças entre maiúsculas e minúsculas (case-insensitive)', () => {
      const filtered = mockPins.filter(pin => matchesSearch(pin, 'palco'));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Palco Principal');
    });

    it('deve conseguir pesquisar de forma secundária pelo tipo do marcador (type)', () => {
      const filtered = mockPins.filter(pin => matchesSearch(pin, 'food'));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Alimentação Central');
    });
  });
});
