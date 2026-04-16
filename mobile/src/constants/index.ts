export const COLORS = {
  bg:         '#0a0a0f',
  bg1:        '#111118',
  bg2:        '#1a1a24',
  bg3:        '#22222e',
  border:     '#2a2a38',
  borderLight:'#333344',
  gold:       '#c9a84c',
  goldLight:  '#e8c547',
  goldDim:    '#8a6f2e',
  goldBg:     '#1a1400',
  white:      '#ffffff',
  gray1:      '#f1f1f5',
  gray2:      '#a0a0b0',
  gray3:      '#6b6b80',
  gray4:      '#44444f',
  green:      '#22c55e',
  greenBg:    '#052e16',
  red:        '#ef4444',
  redBg:      '#2d1515',
};

export const API_BASE = 'http://localhost:5000/api'; // Change to your production URL

export const ANGOLA_CITIES = [
  'Luanda', 'Benguela', 'Lubango', 'Huambo',
  'Malanje', 'Namibe', 'Soyo', 'Cabinda',
];

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartamento', emoji: '🏢' },
  { value: 'house',     label: 'Casa',         emoji: '🏠' },
  { value: 'villa',     label: 'Vivenda',       emoji: '🏡' },
  { value: 'studio',    label: 'Studio',        emoji: '🏨' },
  { value: 'commercial',label: 'Comercial',     emoji: '🏪' },
  { value: 'room',      label: 'Quarto',        emoji: '🛏️'  },
];

export const AMENITIES = [
  'Wi-Fi', 'Ar Condicionado', 'Segurança 24h', 'Parque de Estacionamento',
  'Piscina', 'Ginásio', 'Gerador', 'Água Canalizada', 'Elevador',
  'Varanda', 'Vista ao Mar', 'Cozinha Equipada', 'Porteiro',
];

export function formatPrice(price: number, currency: 'AOA' | 'USD' = 'AOA') {
  if (currency === 'USD') return `$${price.toLocaleString()}`;
  return `${price.toLocaleString('pt-AO')} Kz`;
}

export function formatPeriod(period: string) {
  return period === 'month' ? '/mês' : period === 'week' ? '/sem' : '/dia';
}

export function getWhatsAppUrl(phone: string, message: string) {
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
