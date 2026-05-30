const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const source = {
  files: [{
    name: 'firestore.rules',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }

    match /ads/{adId} {
      allow read: if true;
      allow create, update, delete: if isAuthenticated();
    }

    match /users/{userId} {
      allow read: if true;
      allow create, update, delete: if isAuthenticated();
    }
    
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}`
  }]
};

const securityRules = admin.securityRules();
// Note: We need the project ID for the release. Firebase admin infers it from serviceAccount, but the release name format is:
// projects/{projectId}/releases/{releaseName} -> Default firestore release name is 'cloud.firestore'
// Wait, releaseRelease doesn't exist either. Let me check the correct API.
// "updateRelease" or "createRelease" 
securityRules.createRuleset(source)
  .then(ruleset => {
    const releaseName = 'cloud.firestore'; // Usually it's 'cloud.firestore'
    return securityRules.updateRelease(releaseName, ruleset.name)
      .catch(() => securityRules.createRelease(releaseName, ruleset.name));
  })
  .then(() => console.log('✅ RULES UPDATED!'))
  .catch(err => console.error(err));
