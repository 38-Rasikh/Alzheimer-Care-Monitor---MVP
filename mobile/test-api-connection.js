// Quick API connection test
// Run with: node test-api-connection.js

const http = require('http');

const testUrls = [
  'http://localhost:3001/api/patients',
  'http://10.0.2.2:3001/api/patients', // Android emulator
  'http://10.165.186.31:3001/api/patients', // Your computer's IP
];

console.log('Testing API connections...\n');

testUrls.forEach(url => {
  const urlObj = new URL(url);
  
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname,
    method: 'GET',
    timeout: 3000,
  };

  const req = http.request(options, (res) => {
    console.log(`✅ ${url}`);
    console.log(`   Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`   Patients: ${json.totalCount}\n`);
      } catch (e) {
        console.log(`   Response received\n`);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ ${url}`);
    console.log(`   Error: ${err.message}\n`);
  });

  req.on('timeout', () => {
    console.log(`❌ ${url}`);
    console.log(`   Error: Connection timeout\n`);
    req.destroy();
  });

  req.end();
});
