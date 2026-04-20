const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🚀 Seeding High-Fidelity Data for Youssef Bennani...');

  // 1. Find or Create Youssef
  const hashedPass = await bcrypt.hash('youssef123', 10);
  const user = await prisma.utilisateur.upsert({
    where: { email: 'youssef.bennani@student.ac.ma' },
    update: { nom: 'Bennani', prenom: 'Youssef' },
    create: {
      nom: 'Bennani',
      prenom: 'Youssef',
      email: 'youssef.bennani@student.ac.ma',
      motDePasse: hashedPass,
      role: 'student'
    }
  });

  // Ensure he has a dashboard
  await prisma.dashboard.upsert({
    where: { idUtilisateur: user.id },
    update: {},
    create: { idUtilisateur: user.id, role: 'student' }
  });

  // Find SI filiere
  const filiere = await prisma.filiere.findFirst({ where: { code: 'SI' } });
  if (!filiere) {
    console.error('Filiere SI not found!');
    return;
  }

  const student = await prisma.etudiant.upsert({
    where: { utilisateurId: user.id },
    update: {
      idFiliere: filiere.idFiliere,
      anneeInscription: 3, // Set to 3rd year for PFE
      statut: 'ACTIF'
    },
    create: {
      utilisateurId: user.id,
      cne: 'YB2026-FST',
      idFiliere: filiere.idFiliere,
      anneeInscription: 3,
      statut: 'ACTIF'
    }
  });

  // 2. Add Professional Announcements
  console.log('📢 Adding Announcements...');
  const teacher = await prisma.enseignant.findFirst();
  await prisma.annonce.createMany({
    data: [
      {
        titre: '📢 Séminaire : Intelligence Artificielle & Ethique',
        contenu: 'Nous avons le plaisir de vous convier à un séminaire exceptionnel animé par Dr. Alami ce vendredi à 10h en Amphi A.',
        cible: 'tous',
        idAuteur: teacher.utilisateurId,
        urgent: false
      },
      {
        titre: '⚠️ Rappel : Dépôt des versions préliminaires PFE',
        contenu: 'Tous les étudiants de S6 (3ème année) doivent soumettre leur version préliminaire de rapport avant le 20 Avril.',
        cible: 'Systèmes d\'Information',
        idAuteur: teacher.utilisateurId,
        urgent: true
      },
      {
        titre: '🚀 Opportunité de Stage : Full-Stack Developer',
        contenu: 'Notre partenaire technologique recherche 3 stagiaires pour des projets innovants en React/Node.js.',
        cible: 'tous',
        idAuteur: teacher.utilisateurId,
        urgent: false
      }
    ]
  });

  // 3. Add High-Quality Documents for his modules
  console.log('📚 Adding Course Materials...');
  const modules = await prisma.module.findMany({ where: { idFiliere: filiere.idFiliere } });
  for (let i = 0; i < Math.min(3, modules.length); i++) {
    const mod = modules[i];
    await prisma.document.createMany({
      data: [
        {
          titre: `Support de Cours : ${mod.intitule}`,
          type: 'Cours',
          cheminFichier: `${mod.code.toLowerCase()}_cours_vol1.pdf`,
          idModule: mod.idModule,
          idAuteur: teacher.utilisateurId,
          idFiliere: filiere.idFiliere,
          description: 'Résumé complet du premier chapitre avec exemples pratiques.',
          status: 'PUBLIÉ'
        },
        {
          titre: `Énoncé TP : ${mod.intitule}`,
          type: 'TP',
          cheminFichier: `${mod.code.toLowerCase()}_tp_intro.pdf`,
          idModule: mod.idModule,
          idAuteur: teacher.utilisateurId,
          idFiliere: filiere.idFiliere,
          description: 'Instructions pour la mise en œuvre de la solution demandée.',
          status: 'PUBLIÉ'
        }
      ]
    });
  }

  // 4. Populate PFE data
  console.log('🎓 Setting up PFE...');
  await prisma.pfe.upsert({
    where: { idPG: 1001 }, // Just a fixed ID or find existing
    update: {
      titre: 'Conception et Implémentation d\'une Solution SaaS pour la Gestion des Dossiers Médicaux',
      description: 'Développement d\'une architecture microservices hautement disponible utilisant Docker, Kubernetes et PostgreSQL.',
      statut: 'EN_COURS',
      idEtudiant: student.idEtudiant,
      idEncadrant: teacher.idEnseignant,
      rapportDepose: false
    },
    create: {
      idPG: 1001,
      titre: 'Conception et Implémentation d\'une Solution SaaS pour la Gestion des Dossiers Médicaux',
      description: 'Développement d\'une architecture microservices hautement disponible utilisant Docker, Kubernetes et PostgreSQL.',
      statut: 'EN_COURS',
      idEtudiant: student.idEtudiant,
      idEncadrant: teacher.idEnseignant,
      rapportDepose: false
    }
  });

  // 5. Add a Stage
  console.log('💼 Adding Stage data...');
  await prisma.stage.create({
    data: {
      idEtudiant: student.idEtudiant,
      entreprise: 'Capgemini Morocco',
      dateDebut: new Date('2026-06-01'),
      dateFin: new Date('2026-08-31'),
      conventionStatut: 'SIGNEE',
      rapportDepose: false
    }
  });

  // 6. Clubs
  console.log('🤝 Joining Clubs...');
  const club1 = await prisma.club.upsert({
    where: { idClub: 101 },
    update: {},
    create: {
      idClub: 101,
      nom: 'Club IT & Robotics',
      description: 'Le hub de l\'innovation technologique à la FST.',
      idResponsable: teacher.utilisateurId
    }
  });
  const club2 = await prisma.club.upsert({
    where: { idClub: 102 },
    update: {},
    create: {
      idClub: 102,
      nom: 'FST CyberSecurity',
      description: 'Protection des infrastructures et sensibilisation à la sécurité informatique.',
      idResponsable: teacher.utilisateurId
    }
  });

  // Many-to-many join is tricky with upsert, we use connect
  await prisma.club.update({
    where: { idClub: club1.idClub },
    data: { membres: { connect: { idEtudiant: student.idEtudiant } } }
  });
  await prisma.club.update({
    where: { idClub: club2.idClub },
    data: { membres: { connect: { idEtudiant: student.idEtudiant } } }
  });

  console.log('✅ Youssef Bennani is now fully equipped for the presentation! 🚀');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
