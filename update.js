const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script src="\.\/app\.js/g, '<script src="./compass-engine.js?v=3.9.4"></script>\n  <script src="./app.js');
html = html.replace(/3\.9\.3/g, '3.9.4');
fs.writeFileSync('index.html', html);

let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(/3\.9\.3/g, '3.9.4');
fs.writeFileSync('app.js', app);
