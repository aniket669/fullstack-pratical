const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// ==============================================
// MIDDLEWARE 1: Request Logger (Global)
// ==============================================
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  
  console.log(`[${timestamp}] ${method} ${url}`);
  
  next(); // Pass control to the next middleware
};

// Apply logging middleware globally to all routes
app.use(requestLogger);

// ==============================================
// MIDDLEWARE 2: Bearer Token Authentication
// ==============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header is missing'
    });
  }
  
  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1];
  
  // Check if token exists and is valid
  if (!token || token !== 'mysecrettoken') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or missing Bearer token'
    });
  }
  
  // Token is valid, proceed to the next middleware/route
  next();
};

// ==============================================
// ROUTES
// ==============================================

// PUBLIC ROUTE - No authentication required
app.get('/api/public', (req, res) => {
  res.json({
    message: 'This is a public route, accessible without authentication',
    timestamp: new Date().toISOString()
  });
});

// PROTECTED ROUTE - Requires Bearer token
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Success! You have accessed the protected route',
    data: {
      userId: 123,
      username: 'john_doe',
      role: 'admin'
    },
    timestamp: new Date().toISOString()
  });
});

// Additional protected route example - POST request
app.post('/api/protected/data', authenticateToken, (req, res) => {
  res.json({
    message: 'Data received successfully',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Express Middleware Demo Server',
    routes: {
      public: '/api/public',
      protected: '/api/protected (requires Bearer token)',
      protectedPost: '/api/protected/data (requires Bearer token)'
    }
  });
});

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`========================================\n`);
  console.log(`Available Routes:`);
  console.log(`- GET  /api/public (no auth required)`);
  console.log(`- GET  /api/protected (requires Bearer token)`);
  console.log(`- POST /api/protected/data (requires Bearer token)`);
  console.log(`\nTest with curl:\n`);
  console.log(`Public route:`);
  console.log(`  curl http://localhost:${PORT}/api/public\n`);
  console.log(`Protected route (no token - should fail):`);
  console.log(`  curl http://localhost:${PORT}/api/protected\n`);
  console.log(`Protected route (with valid token):`);
  console.log(`  curl -H "Authorization: Bearer mysecrettoken" http://localhost:${PORT}/api/protected\n`);
});

// ==============================================
// TESTING INSTRUCTIONS
// ==============================================
/*
1. Install dependencies:
   npm install express

2. Run the server:
   node server.js

3. Test using curl:

   a) Test public route (should work):
      curl http://localhost:3000/api/public

   b) Test protected route without token (should fail with 401):
      curl http://localhost:3000/api/protected

   c) Test protected route with wrong token (should fail with 403):
      curl -H "Authorization: Bearer wrongtoken" http://localhost:3000/api/protected

   d) Test protected route with correct token (should succeed):
      curl -H "Authorization: Bearer mysecrettoken" http://localhost:3000/api/protected

   e) Test POST to protected route with token:
      curl -X POST -H "Authorization: Bearer mysecrettoken" -H "Content-Type: application/json" -d '{"name":"John","age":30}' http://localhost:3000/api/protected/data

4. Test using Postman:
   - Open Postman
   - For public route: GET http://localhost:3000/api/public
   - For protected route:
     * GET http://localhost:3000/api/protected
     * Go to "Authorization" tab
     * Select "Bearer Token" type
     * Enter token: mysecrettoken
     * Send request
*/
