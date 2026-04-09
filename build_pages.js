const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'js', 'pages');

const SVG_EDIT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const SVG_TRASH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const SVG_PLUS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const SVG_EYE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const SVG_CHECK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const SVG_CROSS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

const pages = {
  'students.js': `
window.StudentsPage = {
  render() {
    const isAdmin = Auth.isAdmin();
    // RG19, RG20, RG21, RG22: Students tracking with CNE, Status
    // RG23-RG34: PFE & Stages logic included in separate tabs
    let html = \`<div class="pg-header">
      <h2>Gestion des Étudiants, PFE & Stages</h2>
      \${isAdmin ? \`<button class="btn btn-primary" onclick="StudentsPage.add()"><span style="vertical-align:middle">\${'${SVG_PLUS}'}</span> Ajouter Étudiant</button>\` : ''}
    </div>
    
    <div class="tabs" style="margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; display:flex; gap:1rem;">
      <button class="btn btn-ghost active" onclick="StudentsPage.switchTab('etudiants', this)">Étudiants</button>
      <button class="btn btn-ghost" onclick="StudentsPage.switchTab('pfe', this)">PFE</button>
      <button class="btn btn-ghost" onclick="StudentsPage.switchTab('stages', this)">Stages</button>
    </div>

    <div id="tab-content">
      \${this.renderStudents()}
    </div>\`;
    document.getElementById('page-area').innerHTML = html;
  },
  
  switchTab(tab, btnEl) {
    document.querySelectorAll('.tabs .btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    const contentList = {
      'etudiants': this.renderStudents.bind(this),
      'pfe': this.renderPFE.bind(this),
      'stages': this.renderStages.bind(this)
    };
    document.getElementById('tab-content').innerHTML = contentList[tab]();
  },

  renderStudents() {
    const isAdmin = Auth.isAdmin();
    return \`<div class="table-container">
      <table class="data-table">
        <thead><tr><th>CNE</th><th>Photo</th><th>Nom Complet</th><th>Filière</th><th>Groupe</th><th>Statut</th>\${isAdmin ? '<th>Actions</th>' : ''}</tr></thead>
        <tbody>
          \${DB.students.map(s => \`
            <tr>
              <td>\${s.cne}</td>
              <td><div style="width:32px;height:32px;background:#e2e8f0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;">IMG</div></td>
              <td>\${s.name}</td>
              <td>\${DB.filiereName(s.filiereId)}</td>
              <td>\${DB.groupName(s.groupId)}</td>
              <td>\${DB.statusBadge(s.status)}</td>
              \${isAdmin ? \`<td>
                <button class="btn-icon text-blue-600" onclick="StudentsPage.edit(\${s.id})" title="Modifier">\${'${SVG_EDIT}'}</button>
                <button class="btn-icon text-red-600" onclick="StudentsPage.delete(\${s.id})" title="Supprimer">\${'${SVG_TRASH}'}</button>
              </td>\` : ''}
            </tr>
          \`).join('')}
        </tbody>
      </table>
    </div>\`;
  },
  
  renderPFE() {
    return \`<div class="empty-state">
      <h3>Gestion des PFE (Projets de Fin d'Études)</h3>
      <p>Module PFE - Suivi de status: En attente → En cours → Soutenu → Validé</p>
      <p class="text-sm text-gray-500 mt-2">Maximum 2 étudiants par PFE. Jury d'au moins 3 membres.</p>
    </div>\`;
  },

  renderStages() {
    return \`<div class="empty-state">
      <h3>Gestion des Stages</h3>
      <p>Conventions de stage et rapports.</p>
    </div>\`;
  },

  add() { UI.info("Action", "Ajout d'étudiant."); },
  edit(id) { UI.info("Action", "Édition."); },
  delete(id) {
    // RG21: Cannot delete if has grades, absences, pfe
    const hasAbsences = DB.absences.some(a => a.studentId === id);
    const hasGrades = DB.grades && DB.grades.some(g => g.studentId === id);
    if (hasAbsences || hasGrades) {
      UI.error('Action Rejetée', 'Impossible de supprimer un étudiant (RG21) ayant des absences ou des notes.');
      return;
    }
    UI.confirm('Supprimer', 'Voulez-vous vraiment supprimer cet étudiant ?', () => {
      DB.remove('students', id);
      this.render();
      UI.success('Supprimé', 'Étudiant supprimé avec succès.');
    });
  }
};
`,
  'teachers.js': `
window.TeachersPage = {
  render() {
    const isAdmin = Auth.isAdmin();
    // RG35-RG47
    let html = \`<div class="pg-header">
      <h2>Liste des Enseignants</h2>
      \${isAdmin ? \`<div><button class="btn btn-outline" style="margin-right:0.5rem">Exporter PDF</button><button class="btn btn-primary" onclick="TeachersPage.add()"><span style="vertical-align:middle">\${'${SVG_PLUS}'}</span> Ajouter</button></div>\` : ''}
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Nom Complet</th><th>Type</th><th>Grade</th><th>Spécialité</th><th>Charge Horaire</th>\${isAdmin ? '<th>Actions</th>' : ''}</tr></thead>
        <tbody>
          \${DB.teachers.map(t => {
            const currentHours = DB.teacherHours(t.id);
            const exceedAlert = currentHours > t.maxHours ? \`<span style="color:#e53e3e;font-weight:bold" title="Dépassement du volume (RG42/RG43)">\${currentHours}</span>\` : currentHours;
            return \`
            <tr>
              <td>\${t.name}<br><small class="text-gray-500">\${t.email}</small></td>
              <td><span class="badge badge-gray">\${t.type}</span></td>
              <td>\${t.grade}</td>
              <td>\${t.specialty}</td>
              <td>\${exceedAlert} / \${t.maxHours}h</td>
              \${isAdmin ? \`<td>
                <button class="btn-icon text-blue-600" onclick="TeachersPage.edit(\${t.id})" title="Modifier">\${'${SVG_EDIT}'}</button>
                <button class="btn-icon text-red-600" onclick="TeachersPage.delete(\${t.id})" title="Supprimer">\${'${SVG_TRASH}'}</button>
              </td>\` : ''}
            </tr>
          \`}).join('')}
        </tbody>
      </table>
    </div>\`;
    document.getElementById('page-area').innerHTML = html;
  },
  add() {},
  edit(id) {},
  delete(id) {
    // RG45: Cannot delete if assigned to modules
    if (DB.modules.some(m => m.teacherId === id)) {
      UI.error('Action Rejetée', 'Impossible de supprimer un enseignant assigné à des modules actifs (RG45).');
      return;
    }
    UI.confirm('Supprimer', 'Voulez-vous vraiment supprimer cet enseignant ?', () => {
      DB.remove('teachers', id);
      this.render();
      UI.success('Supprimé', 'Enseignant supprimé.');
    });
  }
};
`,
  'schedule.js': `
window.SchedulePage = {
  render() {
    let html = \`<div class="pg-header">
      <h2>Emploi du Temps</h2>
      \${Auth.isAdmin() ? \`<button class="btn btn-primary" onclick="SchedulePage.addSession()"><span style="vertical-align:middle">\${'${SVG_PLUS}'}</span> Nouvelle Séance</button>\` : ''}
    </div>
    <div class="empty-state">
      <h3>📅 Gestion des plannings</h3>
      <p>RG48-RG59: Résolution de conflits, duplication de semestres.</p>
    </div>\`;
    document.getElementById('page-area').innerHTML = html;
  },
  addSession() {
    // TODO: implement session creation logic checking RG50, RG51, RG52
  }
};
`,
  'announcements.js': `
window.AnnouncementsPage = {
  render() {
    const isStudent = Auth.isStudent();
    let myAnnouncements = DB.announcements;
    if (isStudent) {
        // filter by target 
        const u = DB.currentUser;
        const student = DB.students.find(s => s.id === u.linkedId);
        const f = student ? DB.filiereName(student.filiereId) : null;
        myAnnouncements = DB.announcements.filter(a => a.target === 'all' || a.target === f);
    }
    
    // Sort urgent first, then newest
    myAnnouncements.sort((a,b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt));

    let html = \`<div class="pg-header">
      <h2>Annonces</h2>
      \${!isStudent ? \`<button class="btn btn-primary" onclick="AnnouncementsPage.add()"><span style="vertical-align:middle">\${'${SVG_PLUS}'}</span> Publier</button>\` : ''}
    </div>
    <div style="display:flex; flex-direction:column; gap:1rem;">
      \${myAnnouncements.map(a => \`
        <div class="card \${a.urgent ? 'border-red' : ''}" style="\${a.urgent ? 'border-left: 4px solid #e53e3e;' : 'border-left: 4px solid #3182ce;'}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h3 style="margin-bottom:0.5rem; font-weight:600">\${a.title} \${a.urgent ? '<span class="badge badge-red" style="margin-left:0.5rem">URGENT</span>' : ''}</h3>
            <span class="text-sm text-gray-500">\${new Date(a.createdAt).toLocaleDateString()}</span>
          </div>
          <p class="text-gray-700 mt-2" style="white-space: pre-line;">\${a.body}</p>
          <div class="mt-4 text-xs text-gray-500" style="display:flex; gap:1rem;">
            <span>Auteur : \${DB.teacherName(a.authorId) || 'Admin'}</span>
            <span>Cible : \${a.target === 'all' ? 'Toute la promo' : a.target}</span>
          </div>
        </div>
      \`).join('')}
    </div>\`;
    document.getElementById('page-area').innerHTML = html;
    
    // Mark as read
    if(DB.currentUser && DB.currentUser.id) {
       DB.announcements.forEach(a => {
           if(!a.readBy.includes(DB.currentUser.id)) a.readBy.push(DB.currentUser.id);
       });
       UI.updateNotifBadge();
    }
  },
  add() { UI.info("Action", "Création d'annonce non implémentée."); }
};
`,
  'modules.js': `
window.ModulesPage = {
  render() {
    let html = \`<div class="pg-header">
      <h2>Modules & Documents</h2>
      \${Auth.isAdmin() ? \`<button class="btn btn-primary"><span style="vertical-align:middle">\${'${SVG_PLUS}'}</span> Ajouter Module</button>\` : ''}
    </div>
    <div class="empty-state">
      <h3>📚 Ressources Pédagogiques</h3>
      <p>Documents par type (Cours, TD, TP), upload par enseignants, consultable par étudiants.</p>
    </div>\`;
    document.getElementById('page-area').innerHTML = html;
  }
};
`,
  'absences.js': `
window.AbsencesPage = {
  render() {
    const isStudent = Auth.isStudent();
    let myAbsences = DB.absences;
    if (isStudent && DB.currentUser.linkedId) {
       myAbsences = DB.absences.filter(a => a.studentId === DB.currentUser.linkedId);
    }
    
    let html = \`<div class="pg-header">
      <h2>Gestion des Absences</h2>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Date & Séance</th><th>Étudiant</th><th>Statut</th><th>Justificatif</th>\${!isStudent ? '<th>Actions</th>' : ''}</tr></thead>
        <tbody>
          \${myAbsences.map(a => \`
            <tr>
              <td>\${a.date} - Séance \${a.sessionId}</td>
              <td>\${DB.studentName(a.studentId)}</td>
              <td><span class="badge badge-red">Absent</span></td>
              <td>
                \${a.justification ? '<span class="text-sm text-gray-700">Soumis</span>' : '<span class="text-sm text-gray-400">Aucun</span>'}
                <br>\${DB.justifBadge(a.justifStatus)}
              </td>
              \${!isStudent ? \`<td>
                <button class="btn btn-sm btn-ghost">\${'${SVG_EYE}'} Valider</button>
              </td>\` : ''}
            </tr>
          \`).join('')}
        </tbody>
      </table>
    </div>\`;
    document.getElementById('page-area').innerHTML = html;
  }
};
`,
  'rooms.js': `
window.RoomsPage = {
  render() {
    let html = \`<div class="pg-header">
      <h2>Salles & Ressources</h2>
      \${Auth.isAdmin() ? \`<button class="btn btn-primary"><span style="vertical-align:middle">\${'${SVG_PLUS}'}</span> Ajouter Salle</button>\` : ''}
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Nom Salle</th><th>Type</th><th>Capacité</th><th>Équipements</th></tr></thead>
        <tbody>
          \${DB.rooms.map(r => \`
            <tr>
              <td><strong>\${r.name}</strong></td>
              <td>\${r.type}</td>
              <td>\${r.capacity} places</td>
              <td class="text-sm text-gray-600">\${r.equipment.join(', ')}</td>
            </tr>
          \`).join('')}
        </tbody>
      </table>
    </div>\`;
    document.getElementById('page-area').innerHTML = html;
  }
};
`,
  'filieres.js': `
window.FilieresPage = {
  render() {
    let html = \`<div class="pg-header">
      <h2>Filières & Groupes</h2>
    </div>
    <div class="empty-state">
      <h3>🗂️ Structuration Académique</h3>
      <p>Gestion des filières, semestres et groupes TD/TP.</p>
    </div>\`;
    document.getElementById('page-area').innerHTML = html;
  }
};
`,
  'grades.js': `
window.GradesPage = {
  render() {
    let html = \`<div class="pg-header">
      <h2>Notes, Examens & Délibérations</h2>
    </div>
    <div class="empty-state">
      <h3>📝 Gestion des Évaluations</h3>
      <p>Calcul des moyennes : CC × 40% + EF × 60%.</p>
      <p>Règles de validation, rattrapage, et diplomation.</p>
    </div>\`;
    document.getElementById('page-area').innerHTML = html;
  }
};
`,
  'dashboard.js': `
window.DashboardPage = {
  render() {
    const role = DB.currentUser.role;
    let html = '';
    
    if (role === 'admin') {
      html = \`<div class="pg-header">
        <h2>Tableau de Bord — Direction</h2>
      </div>
      <div class="grid" style="grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
        <div class="card">
          <div class="text-sm text-gray-500 uppercase tracking-wide font-semibold">Total Étudiants</div>
          <div class="text-3xl font-bold text-gray-900 mt-2">\${DB.students.length}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 uppercase tracking-wide font-semibold">Enseignants</div>
          <div class="text-3xl font-bold text-gray-900 mt-2">\${DB.teachers.length}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 uppercase tracking-wide font-semibold">Filières Actives</div>
          <div class="text-3xl font-bold text-gray-900 mt-2">\${DB.filieres.length}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-500 uppercase tracking-wide font-semibold">Alertes Absences</div>
          <div class="text-3xl font-bold text-red-600 mt-2">3</div>
        </div>
      </div>
      <div class="grid" style="grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        <div class="card"><h3>Emploi du temps global</h3><div class="empty-state" style="padding:2rem">Aperçu du jour</div></div>
        <div class="card"><h3>Annonces récentes</h3><div class="empty-state" style="padding:2rem">Flux des annonces</div></div>
      </div>\`;
    } else {
      html = \`<div class="pg-header">
        <h2>Bienvenue, \${DB.currentUser.name} !</h2>
      </div>
      <div class="empty-state">
        <h3>Espace \${role === 'teacher' ? 'Enseignant' : 'Étudiant'}</h3>
        <p>Aperçu de mes emplois du temps et de mes messages récents.</p>
      </div>\`;
    }
    
    document.getElementById('page-area').innerHTML = html;
  }
};
`
};

for (const [filename, content] of Object.entries(pages)) {
  fs.writeFileSync(path.join(PAGES_DIR, filename), content.trim());
}
console.log('Pages built.');

const APP_JS_PATH = path.join(__dirname, 'js', 'app.js');
let appJs = fs.readFileSync(APP_JS_PATH, 'utf-8');

appJs = appJs.replace(/icon:\s*'[📊📢👥🎓📚📅📋📝🏛️🗂️]'/g, match => {
  const m = {
    "'📊'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M3 3v18h18\\"></path><path d=\\"M18 17V9\\"></path><path d=\\"M13 17V5\\"></path><path d=\\"M8 17v-3\\"></path></svg>"',
    "'📢'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9\\"></path><path d=\\"M13.73 21a2 2 0 0 1-3.46 0\\"></path></svg>"',
    "'👥'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\\"></path><circle cx=\\"9\\" cy=\\"7\\" r=\\"4\\"></circle><path d=\\"M23 21v-2a4 4 0 0 0-3-3.87\\"></path><path d=\\"M16 3.13a4 4 0 0 1 0 7.75\\"></path></svg>"',
    "'🎓'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M22 10v6M2 10l10-5 10 5-10 5z\\"></path><path d=\\"M6 12v5c3 3 9 3 12 0v-5\\"></path></svg>"',
    "'📚'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z\\"></path><path d=\\"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z\\"></path></svg>"',
    "'📅'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><rect x=\\"3\\" y=\\"4\\" width=\\"18\\" height=\\"18\\" rx=\\"2\\" ry=\\"2\\"></rect><line x1=\\"16\\" y1=\\"2\\" x2=\\"16\\" y2=\\"6\\"></line><line x1=\\"8\\" y1=\\"2\\" x2=\\"8\\" y2=\\"6\\"></line><line x1=\\"3\\" y1=\\"10\\" x2=\\"21\\" y2=\\"10\\"></line></svg>"',
    "'📋'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\\"></path><rect x=\\"8\\" y=\\"2\\" width=\\"8\\" height=\\"4\\" rx=\\"1\\" ry=\\"1\\"></rect></svg>"',
    "'📝'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\\"></path><path d=\\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\\"></path></svg>"',
    "'🏛️'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><polygon points=\\"12 2 2 7 22 7 12 2\\"></polygon><polyline points=\\"2 17 2 22 22 22 22 17\\"></polyline><line x1=\\"6\\" y1=\\"12\\" x2=\\"6\\" y2=\\"17\\"></line><line x1=\\"10\\" y1=\\"12\\" x2=\\"10\\" y2=\\"17\\"></line><line x1=\\"14\\" y1=\\"12\\" x2=\\"14\\" y2=\\"17\\"></line><line x1=\\"18\\" y1=\\"12\\" x2=\\"18\\" y2=\\"17\\"></line></svg>"',
    "'🗂️'": '"<svg width=\\"18\\" height=\\"18\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z\\"></path></svg>"'
  };
  return 'icon: ' + m[match.substring(match.indexOf("'"), match.lastIndexOf("'") + 1)];
});

fs.writeFileSync(APP_JS_PATH, appJs);
console.log('Icons updated in app.js');

const AUTH_JS = path.join(__dirname, 'js', 'auth.js');
let authJs = fs.readFileSync(AUTH_JS, 'utf-8');
authJs = authJs.replace("UI.emptyHTML('🚧', 'Page en construction')", `UI.emptyHTML('<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>', 'Page en construction')`);
fs.writeFileSync(AUTH_JS, authJs);
