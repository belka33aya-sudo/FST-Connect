const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Adding specific users: Aya (Admin), Wissal (Student), Sara (Teacher)...');

  // 1. Create Admin Aya
  const hashedAya = await bcrypt.hash('aya123', 10);
  const userAya = await prisma.utilisateur.upsert({
    where: { email: 'ayabenzian@gmail.com' },
    update: {},
    create: {
      nom: 'Benzian',
      prenom: 'Aya',
      email: 'ayabenzian@gmail.com',
      motDePasse: hashedAya,
      role: 'admin',
    },
  });
  
  await prisma.administrateur.upsert({
    where: { utilisateurId: userAya.id },
    update: {},
    create: {
      utilisateurId: userAya.id,
      matricule: 'ADM-AYA-001',
    },
  });

  await prisma.dashboard.upsert({
    where: { idUtilisateur: userAya.id },
    update: {},
    create: { idUtilisateur: userAya.id, role: 'admin' }
  });

  // 2. Create Teacher Sara
  const hashedSara = await bcrypt.hash('sara123', 10);
  const userSara = await prisma.utilisateur.upsert({
    where: { email: 'saraelhabti@gmail.com' },
    update: {},
    create: {
      nom: 'El Habti',
      prenom: 'Sara',
      email: 'saraelhabti@gmail.com',
      motDePasse: hashedSara,
      role: 'teacher',
    },
  });

  await prisma.enseignant.upsert({
    where: { utilisateurId: userSara.id },
    update: {},
    create: {
      utilisateurId: userSara.id,
      matricule: 'PROF-SARA-101',
      grade: 'PH',
      specialite: 'Informatique',
    },
  });

  await prisma.dashboard.upsert({
    where: { idUtilisateur: userSara.id },
    update: {},
    create: { idUtilisateur: userSara.id, role: 'teacher' }
  });

  // 3. Create Student Wissal
  const hashedWissal = await bcrypt.hash('wissal123', 10);
  const userWissal = await prisma.utilisateur.upsert({
    where: { email: 'wissalbenzian@gmail.com' },
    update: {},
    create: {
      nom: 'Benzian',
      prenom: 'Wissal',
      email: 'wissalbenzian@gmail.com',
      motDePasse: hashedWissal,
      role: 'student',
    },
  });

  // Get a filiere for the student (LSI or any first available)
  const filiere = await prisma.filiere.findFirst();
  
  const student = await prisma.etudiant.upsert({
    where: { utilisateurId: userWissal.id },
    update: {},
    create: {
      utilisateurId: userWissal.id,
      cne: 'WISSAL2026',
      idFiliere: filiere ? filiere.idFiliere : null,
      statut: 'ACTIF',
    },
  });

  await prisma.compteurAbsence.upsert({
    where: { idEtudiant: student.idEtudiant },
    update: {},
    create: { idEtudiant: student.idEtudiant, totalHeuresAbsence: 0 }
  });

  await prisma.dashboard.upsert({
    where: { idUtilisateur: userWissal.id },
    update: {},
    create: { idUtilisateur: userWissal.id, role: 'student' }
  });

  console.log('✅ Specific users added successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
