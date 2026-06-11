const https = require('https');

https.get('https://pruvahub.com/?v=' + Date.now(), res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (match) {
            https.get('https://pruvahub.com' + match[1], jsRes => {
                let jsData = '';
                jsRes.on('data', chunk => jsData += chunk);
                jsRes.on('end', () => {
                    if (jsData.includes('startsWith(`view-`)') || jsData.includes('startsWith("view-")') || jsData.includes("startsWith('view-')")) {
                        console.log('FIX IS LIVE');
                    } else {
                        console.log('FIX IS NOT LIVE');
                    }
                });
            });
        } else {
            console.log('NO MATCH');
        }
    });
});
