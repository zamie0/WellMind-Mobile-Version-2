import http from 'http';

async function testPeerEndpoint() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/peer',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`[TEST] Status: ${res.statusCode}`);
        console.log(`[TEST] Response:`, data);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('[TEST] Error:', error.message);
      resolve();
    });

    req.end();
  });
}

// Wait for server to start
setTimeout(testPeerEndpoint, 2000);
