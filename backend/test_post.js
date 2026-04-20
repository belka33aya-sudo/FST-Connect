require('dotenv').config();
const prisma = require('./prismaClient');
const groupeController = require('./controllers/groupeController');

const req = {
  body: {
    idFiliere: 47,
    type: "TD",
    capaciteMax: 30,
    nom: "TEST-HOT-RELOAD"
  }
};

const res = {
  status: function(code) { console.log('STATUS:', code); return this; },
  json: function(obj) { console.log('RESPONSE:', obj); }
};

groupeController.createGroupe(req, res).then(() => prisma.\$disconnect());
