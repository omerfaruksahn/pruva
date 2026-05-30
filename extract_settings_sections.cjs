const fs = require('fs');

function searchContext(searchTerm, lenBefore = 500, lenAfter = 2500) {
    const bundlePath = 'dist/assets/index-DMRjX6hJ.js';
    if (!fs.existsSync(bundlePath)) {
        console.log('Bundle not found!');
        return;
    }
    const content = fs.readFileSync(bundlePath, 'utf8');
    
    let index = 0;
    let matchCount = 0;
    while (true) {
        index = content.indexOf(searchTerm, index);
        if (index === -1) break;
        matchCount++;
        console.log(`\n================ MATCH ${matchCount} FOR "${searchTerm}" at index ${index} ================`);
        console.log(content.substring(index - lenBefore, index + lenAfter));
        index += searchTerm.length;
    }
}

// Let's search for some distinct strings
searchContext('Profil Bilgileri', 100, 3000);
