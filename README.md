# Safinity-app
![Páginas](readme/mockups2.png)
Aplicação mobile nativa desenvolvida em React Native com Expo para garantir a segurança em eventos públicos de grande escala


# Páginas principais:
- Home: Encontra todos os teus eventos favoritos
- Map: Explora o evento da forma mais segura
- Calendar: Organiza as atividades mais interessantes de eventos
- Friends: Encontra os teus amigos de forma rápida e confiante

![Páginas](readme/mockups.png)

---

## Tecnologias Utilizadas

- React Native
- Expo
- Expo Modules
- JavaScript / TypeScript
- React Navigation
- MapBox API

---

## Estrutura do Projeto

```text

frontend/
├── components/ # Componentes reutilizáveis
├── api/        # comunicação a MapBox
├── context/    # user context
├── constants/  # theme
├── assets/     # Imagens, ícones, fontes
├── data/       # Ficheiros JSON
└── utils/      # Definição das coordenadas para o mapa
```

---

## Pré-requisitos

- Node.js >= 18
- npm / npx
- Expo CLI
- Expo Go

Instalar Expo CLI:
```
npm install -g expo-cli
```
---

## Como Executar o Projeto

1. Instalar dependências:
```
npm install
```
2. Iniciar o projeto:
```
npx expo start
```
3. Executar no dispositivo:
- Ler o QR Code com a app **Expo Go**
- Usar simulador Android
- Usar simulador iOS (macOS)

---

## Configuração de Ambiente

Cria um ficheiro `.env` em frontend/ :

''' 
EXPO_PUBLIC_MAPBOX_TOKEN=key_para_mapbox
'''

---

## Autores


- [André Dora](https://github.com/andredora)
- [Beatriz Castro](https://github.com/castro-beatriz)
- [Inês Ferreira](https://github.com/inesitadivertida02)
- [Marta Silva](https://github.com/martacss)
- [Sara Pombo](https://github.com/sarapombo)

