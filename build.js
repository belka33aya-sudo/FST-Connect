const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/main.css', 'utf8');

const jsFiles = [
  'js/data.js',
  'js/ui.js',
  'js/auth.js',
  'js/pages/dashboard.js',
  'js/pages/students.js',
  'js/pages/teachers.js',
  'js/pages/schedule.js',
  'js/pages/announcements.js',
  'js/pages/modules.js',
  'js/pages/absences.js',
  'js/pages/rooms.js',
  'js/pages/filieres.js',
  'js/pages/grades.js',
  'js/app.js'
];

let compiledJs = '';
jsFiles.forEach(file => {
  compiledJs += '\n/* --- ' + file + ' --- */\n';
  compiledJs += fs.readFileSync(file, 'utf8') + '\n';
});

let newHtml = indexHtml.replace(
  '<link rel="stylesheet" href="css/main.css">',
  `<style>\n${css}\n</style>`
);

// Remove existing script tags
newHtml = newHtml.replace(/<script src="js\/.*?"><\/script>\n?/g, '');

// Insert combined JS
newHtml = newHtml.replace(
  '</body>',
  `<script>\n${compiledJs}\n</script>\n</body>`
);

fs.writeFileSync('GDI_App.html', newHtml);
console.log('Successfully bundled into GDI_App.html!');
