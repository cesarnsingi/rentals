export function formatPrice(price: number, currency: 'AOA' | 'USD' = 'AOA') {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  }
  return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price) + ' Kz';
}

export function formatPricePeriod(period: string) {
  return period === 'month' ? '/mês' : period === 'week' ? '/semana' : '/dia';
}

export const ANGOLA_CITIES = ['Luanda', 'Benguela', 'Lubango', 'Huambo', 'Malanje', 'Namibe', 'Soyo', 'Cabinda'];

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house',     label: 'Casa'         },
  { value: 'villa',     label: 'Vivenda'       },
  { value: 'studio',    label: 'Studio'        },
  { value: 'commercial',label: 'Comercial'     },
  { value: 'room',      label: 'Quarto'        },
];

export const AMENITIES = [
  'Wi-Fi', 'Ar Condicionado', 'Segurança 24h', 'Parque de Estacionamento',
  'Piscina', 'Ginásio', 'Gerador', 'Água Canalizada', 'Elevador',
  'Varanda', 'Vista ao Mar', 'Cozinha Equipada', 'Porteiro',
];

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getWhatsAppUrl(phone: string, message: string) {
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
