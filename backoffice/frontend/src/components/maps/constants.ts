// src/constants/mapIcons.ts
import foodPin from '../../assets/images/food-pin.png';
import wcPin from '../../assets/images/wc-pin.png';
import exitPin from '../../assets/images/exit-pin.png';
import entrancePin from '../../assets/images/entrance-pin.png';

export const PIN_ICONS: Record<'food' | 'wc' | 'exit' | 'entrance', string> = {
  food: foodPin,
  wc: wcPin,
  exit: exitPin,
  entrance: entrancePin,
};
