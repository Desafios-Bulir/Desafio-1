import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.transaction.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log('Dados anteriores limpos');

  // ===== CLIENTES =====
  const client1 = await prisma.user.create({
    data: {
      fullName: 'Gilson Chipombo',
      phone: '923123456',
      email: 'gilson@gmail.com',
      password: await bcrypt.hash('123456', 10),
      role: UserRole.CLIENT,
      balance: 4000,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      fullName: 'Sandra Bravo',
      phone: '923234567',
      email: 'sandra@gmail.com',
      password: await bcrypt.hash('123456', 10),
      role: UserRole.CLIENT,
      balance: 5500,
    },
  });

  const client3 = await prisma.user.create({
    data: {
      fullName: 'Diogo Chipombo',
      phone: '923345678',
      email: 'diogo@gmail.com',
      password: await bcrypt.hash('123456', 10),
      role: UserRole.CLIENT,
      balance: 3200,
    },
  });

  console.log('3 clientes criados');

  // ===== PRESTADORES =====
  const provider1 = await prisma.user.create({
    data: {
      fullName: 'Bulir Empresa',
      phone: '923456789',
      nif: '5123456789',
      email: 'bulir@gmail.com',
      password: await bcrypt.hash('123456', 10),
      role: UserRole.PROVIDER,
      balance: 0,
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      fullName: 'Pedro Barbeiro',
      phone: '923567890',
      nif: '5234567890',
      email: 'pedro.barbeiro@gmail.com',
      password: await bcrypt.hash('123456', 10),
      role: UserRole.PROVIDER,
      balance: 0,
    },
  });

  const provider3 = await prisma.user.create({
    data: {
      fullName: 'Carlos Encanador',
      phone: '923678901',
      nif: '5345678901',
      email: 'carlos.encanador@gmail.com',
      password: await bcrypt.hash('123456', 10),
      role: UserRole.PROVIDER,
      balance: 0,
    },
  });

  console.log('3 prestadores criados');

  // ===== SERVIÇOS =====
  const service1 = await prisma.service.create({
    data: {
      name: 'Corte de Cabelo',
      description: 'Corte profissional com acabamento perfeito',
      price: 500,
      providerId: provider1.id,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Barba Completa',
      description: 'Barba com tesoura e navalha, design personalizado',
      price: 800,
      providerId: provider2.id,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      name: 'Reparação Hidráulica',
      description: 'Conserto de canos e torneiras',
      price: 2000,
      providerId: provider3.id,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      name: 'Limpeza de Casa',
      description: 'Limpeza profissional completa da residência',
      price: 1500,
      providerId: provider1.id,
    },
  });

  console.log('4 serviços criados');

  // ===== RESERVAS =====
  const booking1 = await prisma.booking.create({
    data: {
      status: BookingStatus.COMPLETED,
      clientId: client1.id,
      serviceId: service1.id,
      scheduledAt: new Date('2026-05-15T10:00:00'),
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      status: BookingStatus.PENDING,
      clientId: client2.id,
      serviceId: service2.id,
      scheduledAt: new Date('2026-05-20T14:00:00'),
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      status: BookingStatus.COMPLETED,
      clientId: client3.id,
      serviceId: service3.id,
      scheduledAt: new Date('2026-05-10T09:00:00'),
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      status: BookingStatus.PENDING,
      clientId: client1.id,
      serviceId: service4.id,
      scheduledAt: new Date('2026-05-22T15:30:00'),
    },
  });

  console.log('4 reservas criadas');

  // ===== TRANSAÇÕES =====
  await prisma.transaction.create({
    data: {
      fromUserId: client1.id,
      toUserId: provider1.id,
      bookingId: booking1.id,
      amount: 500,
    },
  });

  await prisma.transaction.create({
    data: {
      fromUserId: client3.id,
      toUserId: provider3.id,
      bookingId: booking3.id,
      amount: 2000,
    },
  });

  console.log('2 transações criadas');

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(' Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
