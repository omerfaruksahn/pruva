const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-DMRjX6hJ.js', 'utf8');

function findIndices(word) {
    let index = 0;
    const indices = [];
    while (true) {
        index = content.indexOf(word, index);
        if (index === -1) break;
        indices.push(index);
        index += word.length;
    }
    console.log(`Word "${word}" indices:`, indices);
}

findIndices('avatar-wrapper-settings');
findIndices('settingsView');
findIndices('VIEW_INIT_MAP');
findIndices('updateNavbarUI');
findIndices('StatusPages');
findIndices('ROUTE_MAP');
