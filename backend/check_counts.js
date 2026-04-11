const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const counts = {
    utilisateurs: await prisma.utilisateur.count(),
    etudiants: await prisma.etudiant.count(),
    enseignants: await prisma.enseignant.count(),
    modules: await prisma.module.count(),
    filieres: await prisma.filiere.count(),
    annonces: await prisma.annonce.count(),
    clubs: await prisma.club.count(),
    notes: await prisma.note.count(),
    absences: await prisma.absence.count(),
    pfes: await prisma.pfe.count(),
    salles: await prisma.salle.count(),
  };
  console.log(JSON.stringify(counts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
