const glob = require('glob');
const fs = require('fs');

const files = glob.sync('./**/*.html');

fs.writeFileSync('pages.txt', files.join('\n'));
