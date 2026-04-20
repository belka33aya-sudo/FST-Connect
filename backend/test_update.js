require('dotenv').config();
const prisma = require('./prismaClient');
const filiereController = require('./controllers/filiereController');

const req = {
  params: { id: '47' },
  body: {
    code: "BCG",
    intitule: "Biologie Chimie G\u00e9ologie",
    niveauEtude: "Cycle d'Ing\u00e9nieur",
    nombreSemestres: 6,
    duree: 3
  }
};

const res = {
  json: console.log,
  status: function(code) { console.log('STATUS:', code); return this; }
};

filiereController.updateFiliere(req, res).then(() => prisma.$disconnect());
