// src/assets/images/Events/index.ts
// Map de IDs para imagens estáticas (Vite-friendly)
import arraialBelem from './cultural/arraial-belem.webp';
import festivalCanais from './cultural/Festival-dos-Canais.jpg';
import olhao from './cultural/olhao.webp';
import santosPopulares from './cultural/santos-populares.webp';

import meoSudoeste from './musical/meo_sudoeste.jpg';
import meoMaresVivas from './musical/meo-mares-vivas.jpg';
import nosAlive from './musical/NOS-Alive.jpg';
import superbockSuperRock from './musical/super-bock-super-rock.jpg';

import futurtech from './tech/future-tech.webp';
import portugalTechWeek from './tech/Portugal-Tech-Week.png';
import techBusinessSummit from './tech/tech-business-summit.jpg';
import webSummit from './tech/web-summit.png';

export const eventImages: { [key: string]: string } = {
  // CULTURAL
  'grande-arraial-belem-2025': arraialBelem,
  'festival-dos-canais-2025': festivalCanais,
  'olhao-city-festival-2025': olhao,
  'santos-populares-2025': santosPopulares,

  // MUSICAL
  'meo-sudoeste-2025': meoSudoeste,
  'meo-mares-vivas-2025': meoMaresVivas,
  'nos-alive-2025': nosAlive,
  'superbock-superrock-2025': superbockSuperRock,

  // TECH
  'futurtech-experience-2026': futurtech,
  'portugal-tech-week-2026': portugalTechWeek,
  'tech-business-summit-2026': techBusinessSummit,
  'web-summit-2025': webSummit,
};
