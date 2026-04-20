const prisma = require('../prismaClient');

async function main() {
  console.log('🚀 Finalizing Demo Data for Youssef Bennani...');

  // 1. Find the target Youssef Bennani (the one active in the demo)
  const user = await prisma.utilisateur.findFirst({
    where: { 
      nom: 'Bennani', 
      prenom: 'Youssef',
      role: 'student'
    }
  });

  if (!user) {
    console.error('❌ Youssef Bennani not found!');
    return;
  }
  console.log(`Found user: ${user.email} (ID: ${user.id})`);

  const student = await prisma.etudiant.update({
    where: { utilisateurId: user.id },
    data: {
      anneeInscription: 3, // Crucial for PFE visibility
      statut: 'ACTIF'
    }
  });
  console.log(`Updated student year to 3. (ID Etudiant: ${student.idEtudiant})`);

  // 2. Clear and Add PFE/Stage for THIS student
  await prisma.pfe.deleteMany({ where: { idEtudiant: student.idEtudiant } });
  await prisma.stage.deleteMany({ where: { idEtudiant: student.idEtudiant } });

  const teacher = await prisma.enseignant.findFirst();

  await prisma.pfe.create({
    data: {
      titre: 'Cloud Engineering & Microservices Architecture',
      description: 'Mise en place d\'une infrastructure cloud native hautement résiliente avec orchestration Kubernetes et service mesh Istio.',
      statut: 'EN_COURS',
      idEtudiant: student.idEtudiant,
      idEncadrant: teacher.idEnseignant,
      rapportDepose: false
    }
  });

  await prisma.stage.create({
    data: {
      idEtudiant: student.idEtudiant,
      entreprise: 'Amazon Web Services (AWS)',
      dateDebut: new Date('2026-07-01'),
      dateFin: new Date('2026-09-30'),
      conventionStatut: 'SIGNEE',
      rapportDepose: false,
      noteStage: null
    }
  });

  // 3. Add Professional Formations & Collaborators
  console.log('🎓 Seeding Formations & Collaborators...');
  await prisma.inscription.deleteMany({}); // Clean old inscriptions
  await prisma.formation.deleteMany({});
  await prisma.collaborateur.deleteMany({});

  const col1 = await prisma.collaborateur.create({
    data: {
      nomOrganisme: 'Oracle University',
      contact: 'contact@oracle.com',
      domaine: 'Cloud & Database'
    }
  });

  const col2 = await prisma.collaborateur.create({
    data: {
      nomOrganisme: 'Cisco Networking Academy',
      contact: 'academy@cisco.com',
      domaine: 'CyberSecurity & Networking'
    }
  });

  await prisma.formation.createMany({
    data: [
      {
        intitule: 'Oracle Certified Professional: Java SE 17 Developer',
        description: 'Maîtrisez les concepts avancés de Java et préparez-vous à la certification OCP.',
        type: 'Certification Professionnelle',
        statut: 'DISPONIBLE',
        idCollaborateur: col1.idCollaborateur
      },
      {
        intitule: 'CCNA: Introduction to Networks',
        description: 'Apprenez les bases des architectures réseaux, de la commutation et du routage.',
        type: 'Formation Technique',
        statut: 'DISPONIBLE',
        idCollaborateur: col2.idCollaborateur
      },
      {
        intitule: 'AWS Solutions Architect Associate',
        description: 'Concevez des solutions robustes et évolutives sur la plateforme AWS.',
        type: 'Expertise Cloud',
        statut: 'BIENTÔT DISPONIBLE',
        idCollaborateur: col1.idCollaborateur
      }
    ]
  });

  // 4. Ensure Announcements match the intitule
  const filiere = await prisma.filiere.findUnique({ where: { idFiliere: student.idFiliere } });
  if (filiere) {
      await prisma.annonce.create({
        data: {
          titre: `📢 Session Spéciale : ${filiere.intitule}`,
          contenu: `Une séance de coaching PFE pour la filière ${filiere.intitule} aura lieu demain soir sur Zoom.`,
          cible: filiere.intitule,
          idAuteur: teacher.utilisateurId,
          urgent: true
        }
      });
  }

  console.log('✅ Final Demodata Seeded Successfully! 🚀');
}

main()
  .catch((e) => {
    console.error('❌ Final Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
