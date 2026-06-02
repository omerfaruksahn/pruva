const jwt = require('jsonwebtoken'); 
const token = jwt.sign({ id: 1, email: 'omerfaruksahin@gmail.com' }, 'pruva_a9f2b8c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E', { expiresIn: '1h' }); 
fetch('http://localhost:5001/api/ai/analyze', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, 
    body: JSON.stringify({ message: 'analiz et', conversationId: 'copilot' }) 
}).then(res=>res.text()).then(console.log);
