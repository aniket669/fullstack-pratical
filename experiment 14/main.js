const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;

// Secret key for JWT signing (In production, use environment variables)
const JWT_SECRET = 'your-secret-key-keep-it-safe';
const TOKEN_EXPIRY = '1h'; // Token expires in 1 hour

// Middleware to parse JSON
app.use(express.json());

// ==============================================
// MOCK USER DATABASE
// ==============================================
const users = {
  'john_doe': {
    username: 'john_doe',
    password: 'password123',
    accountId: 'ACC001',
    balance: 5000
  },
  'jane_smith': {
    username: 'jane_smith',
    password: 'secure456',
    accountId: 'ACC002',
    balance: 10000
  },
  'bob_wilson': {
    username: 'bob_wilson',
    password: 'mypass789',
    accountId: 'ACC003',
    balance: 2500
  }
};

// ==============================================
// MIDDLEWARE: REQUEST LOGGER
// ==============================================
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

app.use(requestLogger);

// ==============================================
// MIDDLEWARE: JWT VERIFICATION
// ==============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header is missing. Please provide a Bearer token.'
    });
  }
  
  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token is missing from Authorization header.'
    });
  }
  
  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has expired. Please login again.'
        });
      }
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid token. Authentication failed.'
      });
    }
    
    // Attach user info to request object
    req.user = decoded;
    next();
  });
};

// ==============================================
// PUBLIC ROUTES
// ==============================================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Secure Banking API',
    version: '1.0.0',
    endpoints: {
      login: 'POST /login',
      balance: 'GET /balance (protected)',
      deposit: 'POST /deposit (protected)',
      withdraw: 'POST /withdraw (protected)'
    },
    note: 'Protected routes require Bearer token in Authorization header'
  });
});

// Login route - Generate JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Username and password are required'
    });
  }
  
  // Check if user exists and password matches
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid username or password'
    });
  }
  
  // Generate JWT token
  const payload = {
    username: user.username,
    accountId: user.accountId
  };
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  
  res.json({
    message: 'Login successful',
    token: token,
    user: {
      username: user.username,
      accountId: user.accountId
    },
    expiresIn: TOKEN_EXPIRY
  });
});

// ==============================================
// PROTECTED ROUTES - BANKING OPERATIONS
// ==============================================

// Get account balance
app.get('/balance', authenticateToken, (req, res) => {
  const user = users[req.user.username];
  
  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'User account not found'
    });
  }
  
  res.json({
    message: 'Balance retrieved successfully',
    accountId: user.accountId,
    username: user.username,
    balance: user.balance,
    currency: 'USD',
    timestamp: new Date().toISOString()
  });
});

// Deposit money
app.post('/deposit', authenticateToken, (req, res) => {
  const { amount } = req.body;
  const user = users[req.user.username];
  
  // Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid deposit amount. Amount must be a positive number.'
    });
  }
  
  if (amount > 100000) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Deposit amount exceeds maximum limit of $100,000'
    });
  }
  
  // Update balance
  const previousBalance = user.balance;
  user.balance += amount;
  
  res.json({
    message: 'Deposit successful',
    transaction: {
      type: 'DEPOSIT',
      amount: amount,
      previousBalance: previousBalance,
      newBalance: user.balance,
      accountId: user.accountId,
      timestamp: new Date().toISOString()
    }
  });
});

// Withdraw money
app.post('/withdraw', authenticateToken, (req, res) => {
  const { amount } = req.body;
  const user = users[req.user.username];
  
  // Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid withdrawal amount. Amount must be a positive number.'
    });
  }
  
  // Check sufficient balance
  if (amount > user.balance) {
    return res.status(400).json({
      error: 'Insufficient Funds',
      message: `Insufficient balance. Available balance: $${user.balance}`,
      availableBalance: user.balance,
      requestedAmount: amount
    });
  }
  
  if (amount > 10000) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Withdrawal amount exceeds maximum limit of $10,000 per transaction'
    });
  }
  
  // Update balance
  const previousBalance = user.balance;
  user.balance -= amount;
  
  res.json({
    message: 'Withdrawal successful',
    transaction: {
      type: 'WITHDRAWAL',
      amount: amount,
      previousBalance: previousBalance,
      newBalance: user.balance,
      accountId: user.accountId,
      timestamp: new Date().toISOString()
    }
  });
});

// Get transaction history (bonus route)
app.get('/account/info', authenticateToken, (req, res) => {
  const user = users[req.user.username];
  
  res.json({
    message: 'Account information retrieved successfully',
    account: {
      accountId: user.accountId,
      username: user.username,
      balance: user.balance,
      currency: 'USD',
      accountType: 'Savings',
      status: 'Active'
    },
    timestamp: new Date().toISOString()
  });
});

// ==============================================
// ERROR HANDLING
// ==============================================

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

// ==============================================
// START SERVER
// ==============================================
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏦  SECURE BANKING API SERVER`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}\n`);
  
  console.log(`📋 Available Test Accounts:`);
  console.log(`   Username: john_doe    | Password: password123 | Balance: $5,000`);
  console.log(`   Username: jane_smith  | Password: secure456   | Balance: $10,000`);
  console.log(`   Username: bob_wilson  | Password: mypass789   | Balance: $2,500\n`);
  
  console.log(`🔐 API Endpoints:`);
  console.log(`   POST /login              - Authenticate and get JWT token`);
  console.log(`   GET  /balance            - View account balance (protected)`);
  console.log(`   POST /deposit            - Deposit money (protected)`);
  console.log(`   POST /withdraw           - Withdraw money (protected)`);
  console.log(`   GET  /account/info       - Get account details (protected)\n`);
  
  console.log(`🧪 Testing Instructions:\n`);
  console.log(`1. Login to get token:`);
  console.log(`   curl -X POST http://localhost:${PORT}/login \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"username":"john_doe","password":"password123"}'\n`);
  
  console.log(`2. Use the token to check balance:`);
  console.log(`   curl http://localhost:${PORT}/balance \\`);
  console.log(`     -H "Authorization: Bearer YOUR_TOKEN_HERE"\n`);
  
  console.log(`3. Deposit money:`);
  console.log(`   curl -X POST http://localhost:${PORT}/deposit \\`);
  console.log(`     -H "Authorization: Bearer YOUR_TOKEN_HERE" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"amount":500}'\n`);
  
  console.log(`4. Withdraw money:`);
  console.log(`   curl -X POST http://localhost:${PORT}/withdraw \\`);
  console.log(`     -H "Authorization: Bearer YOUR_TOKEN_HERE" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"amount":200}'\n`);
  
  console.log(`${'='.repeat(60)}\n`);
});

// ==============================================
// POSTMAN TESTING GUIDE
// ==============================================
/*
POSTMAN TESTING STEPS:

1. LOGIN:
   - Method: POST
   - URL: http://localhost:3000/login
   - Headers: Content-Type: application/json
   - Body (raw JSON):
     {
       "username": "john_doe",
       "password": "password123"
     }
   - Copy the token from response

2. CHECK BALANCE:
   - Method: GET
   - URL: http://localhost:3000/balance
   - Authorization: Bearer Token (paste your token)

3. DEPOSIT:
   - Method: POST
   - URL: http://localhost:3000/deposit
   - Authorization: Bearer Token
   - Body (raw JSON):
     {
       "amount": 1000
     }

4. WITHDRAW:
   - Method: POST
   - URL: http://localhost:3000/withdraw
   - Authorization: Bearer Token
   - Body (raw JSON):
     {
       "amount": 500
     }

5. TEST ERROR SCENARIOS:
   - Try accessing /balance without token (should fail)
   - Try with invalid token (should fail)
   - Try withdrawing more than balance (should fail)
   - Try invalid login credentials (should fail)
*/
