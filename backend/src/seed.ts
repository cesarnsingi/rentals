import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/database';
import User from './models/User';
import Listing from './models/Listing';

const CITIES = [
  { city: 'Luanda',   districts: ['Maianga', 'Ingombota', 'Rangel', 'Cazenga', 'Miramar', 'Talatona'] },
  { city: 'Benguela', districts: ['Centro', 'Lobito', 'Baía Farta'] },
  { city: 'Lubango',  districts: ['Centro', 'Bairro Popular', 'Tchivinguiro'] },
  { city: 'Huambo',   districts: ['Centro', 'Catchiungo'] },
];

const AMENITIES_POOL = [
  'Wi-Fi', 'Ar Condicionado', 'Segurança 24h', 'Parque de Estacionamento',
  'Piscina', 'Ginásio', 'Gerador', 'Água Canalizada', 'Elevador',
  'Varanda', 'Vista ao Mar', 'Cozinha Equipada', 'Porteiro',
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  await connectDB();
  console.log('Seeding...');

  await User.deleteMany({});
  await Listing.deleteMany({});

  // Admin
  const admin = await User.create({
    name: 'Admin Angola', email: 'admin@angola-rentals.ao',
    password: 'Admin@1234', role: 'admin', isVerified: true,
  });

  // Landlords
  const landlords = await User.insertMany([
    { name: 'Carlos Andrade',  email: 'carlos@landlord.ao', password: 'Test@1234', role: 'landlord', isVerified: true, phone: '+244923456789' },
    { name: 'Maria Santos',    email: 'maria@landlord.ao',  password: 'Test@1234', role: 'landlord', isVerified: true, phone: '+244924567890' },
    { name: 'João Ferreira',   email: 'joao@landlord.ao',   password: 'Test@1234', role: 'landlord', isVerified: true, phone: '+244925678901' },
    { name: 'Ana Rodrigues',   email: 'ana@landlord.ao',    password: 'Test@1234', role: 'landlord', isVerified: true, phone: '+244926789012' },
  ]);

  // Listings
  const types = ['apartment', 'house', 'villa', 'studio', 'room'] as const;
  const listings = [];

  for (let i = 0; i < 40; i++) {
    const cityData = pick(CITIES);
    const landlord = pick(landlords);
    const type     = pick(types);
    const rooms    = randomBetween(1, 5);
    const price    = type === 'villa'
      ? randomBetween(500000, 2000000)
      : type === 'house'
      ? randomBetween(200000, 800000)
      : type === 'studio'
      ? randomBetween(50000, 150000)
      : randomBetween(80000, 400000);

    const slug = `${type}-${cityData.city.toLowerCase()}-${i + 1}-${Date.now()}`;

    listings.push({
      title:       `${type === 'apartment' ? 'Apartamento' : type === 'house' ? 'Casa' : type === 'villa' ? 'Vivenda' : type === 'studio' ? 'Studio' : 'Quarto'} T${rooms} em ${cityData.city}`,
      slug,
      description: `Excelente imóvel localizado em ${pick(cityData.districts)}, ${cityData.city}. Zona tranquila com fácil acesso a transportes, comércio e escolas. Imóvel em ótimo estado de conservação.`,
      type,
      price,
      pricePeriod: 'month',
      currency:    Math.random() > 0.3 ? 'AOA' : 'USD',
      bedrooms:    rooms,
      bathrooms:   Math.max(1, Math.floor(rooms / 2)),
      area:        type === 'villa' ? randomBetween(200, 500) : randomBetween(50, 200),
      furnished:   Math.random() > 0.5,
      amenities:   AMENITIES_POOL.filter(() => Math.random() > 0.5).slice(0, randomBetween(3, 8)),
      images: [
        { url: `https://picsum.photos/seed/${slug}/800/600`, publicId: `seed-${slug}-1` },
        { url: `https://picsum.photos/seed/${slug}2/800/600`, publicId: `seed-${slug}-2` },
        { url: `https://picsum.photos/seed/${slug}3/800/600`, publicId: `seed-${slug}-3` },
      ],
      location: {
        city:     cityData.city,
        district: pick(cityData.districts),
        address:  `Rua ${randomBetween(1, 100)}, ${pick(cityData.districts)}, ${cityData.city}`,
        coordinates: {
          lat: -8.8368 + (Math.random() - 0.5) * 0.5,
          lng: 13.2343 + (Math.random() - 0.5) * 0.5,
        },
      },
      landlord:        landlord._id,
      featured:        Math.random() > 0.7,
      viewCount:       randomBetween(0, 500),
      contactPhone:    landlord.phone,
      contactWhatsApp: landlord.phone,
      contactEmail:    landlord.email,
      status:          'available',
    });
  }

  await Listing.insertMany(listings);

  console.log('✅ Seed complete');
  console.log('Admin: admin@angola-rentals.ao / Admin@1234');
  console.log('Landlord: carlos@landlord.ao / Test@1234');
  await mongoose.disconnect();
}

seed().catch(console.error);
