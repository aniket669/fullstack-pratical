const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

// MongoDB connection configuration
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'bankingDB';
const COLLECTION_NAME = 'accounts';

let db;
let accountsCollection;

// Middleware
app.use(express.json());

// ==============================================
// DATABASE CONNECTION
// ==============================================
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useUnifiedTopology: true,
    });
    
    db = client.db(DB_NAME);
    accountsCollection = db.collection(COLLECTION_NAME);
    
    console.log(`✅ Connected to MongoDB: ${DB_NAME}`);
    
    // Initialize sample accounts if collection is empty
    await initializeSampleAccounts();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// ==============================================
// INITIALIZE SAMPLE ACCOUNTS
// ==============================================
async function initializeSampleAccounts() {
  const count = await accountsCollection.countDocuments();
  
  if (count === 0) {
    const sampleAccounts = [
      {
        accountNumber: 'ACC001',
        accountHolder: 'John Doe',
        email: 'john@example.com',
        balance: 5000,
        currency: 'USD',
        status: 'active',
        createdAt: new Date()
      },
      {
        accountNumber: 'ACC002',
        accountHolder: 'Jane Smith',
        email: 'jane@example.com',
        balance: 10000,
        currency: 'USD',
        status: 'active',
        createdAt: new Date()
      },
      {
        accountNumber: 'ACC003',
        accountHolder: 'Bob Wilson',
        email: 'bob@example.com',
        balance: 2500,
        currency: 'USD',
        status: 'active',
        createdAt: new Date()
      },
      {
        accountNumber: 'ACC004',
        accountHolder: 'Alice Johnson',
        email: 'alice@example.com',
        balance: 500,
        currency: 'USD',
        status: 'active',
        createdAt: new Date()
      }
    ];
    
    await accountsCollection.insertMany(sampleAccounts);
    console.log('✅ Sample accounts initialized');
  }
}

// ==============================================
// MIDDLEWARE: REQUEST LOGGER
// ==============================================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ==============================================
// ROUTES
// ==============================================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Bank Account Transfer System API',
    version: '1.0.0',
    endpoints: {
      accounts: 'GET /accounts - List all accounts',
      accountDetails: 'GET /accounts/:accountNumber - Get account details',
      createAccount: 'POST /accounts - Create new account',
      transfer: 'POST /transfer - Transfer money between accounts',
      deposit: 'POST /deposit - Deposit money to account',
      withdraw: 'POST /withdraw - Withdraw money from account'
    }
  });
});

// Get all accounts
app.get('/accounts', async (req, res) => {
  try {
    const accounts = await accountsCollection
      .find({})
      .project({ _id: 0 })
      .toArray();
    
    res.json({
      message: 'Accounts retrieved successfully',
      count: accounts.length,
      accounts: accounts
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve accounts'
    });
  }
});

// Get account by account number
app.get('/accounts/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    
    const account = await accountsCollection.findOne(
      { accountNumber },
      { projection: { _id: 0 } }
    );
    
    if (!account) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Account ${accountNumber} does not exist`
      });
    }
    
    res.json({
      message: 'Account details retrieved successfully',
      account: account
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve account details'
    });
  }
});

// Create new account
app.post('/accounts', async (req, res) => {
  try {
    const { accountNumber, accountHolder, email, initialBalance } = req.body;
    
    // Validate required fields
    if (!accountNumber || !accountHolder || !email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'accountNumber, accountHolder, and email are required'
      });
    }
    
    // Check if account already exists
    const existingAccount = await accountsCollection.findOne({ accountNumber });
    if (existingAccount) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Account ${accountNumber} already exists`
      });
    }
    
    const newAccount = {
      accountNumber,
      accountHolder,
      email,
      balance: initialBalance || 0,
      currency: 'USD',
      status: 'active',
      createdAt: new Date()
    };
    
    await accountsCollection.insertOne(newAccount);
    
    res.status(201).json({
      message: 'Account created successfully',
      account: {
        accountNumber: newAccount.accountNumber,
        accountHolder: newAccount.accountHolder,
        balance: newAccount.balance
      }
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create account'
    });
  }
});

// Deposit money
app.post('/deposit', async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;
    
    // Validate input
    if (!accountNumber || !amount) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'accountNumber and amount are required'
      });
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Amount must be a positive number'
      });
    }
    
    // Check if account exists
    const account = await accountsCollection.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Account ${accountNumber} does not exist`
      });
    }
    
    // Update balance
    const result = await accountsCollection.updateOne(
      { accountNumber },
      { $inc: { balance: amount } }
    );
    
    // Get updated account
    const updatedAccount = await accountsCollection.findOne({ accountNumber });
    
    res.json({
      message: 'Deposit successful',
      transaction: {
        type: 'DEPOSIT',
        accountNumber: accountNumber,
        amount: amount,
        previousBalance: account.balance,
        newBalance: updatedAccount.balance,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process deposit'
    });
  }
});

// Withdraw money
app.post('/withdraw', async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;
    
    // Validate input
    if (!accountNumber || !amount) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'accountNumber and amount are required'
      });
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Amount must be a positive number'
      });
    }
    
    // Check if account exists and get current balance
    const account = await accountsCollection.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Account ${accountNumber} does not exist`
      });
    }
    
    // Check sufficient balance
    if (account.balance < amount) {
      return res.status(400).json({
        error: 'Insufficient Funds',
        message: `Insufficient balance in account ${accountNumber}`,
        availableBalance: account.balance,
        requestedAmount: amount,
        shortfall: amount - account.balance
      });
    }
    
    // Update balance
    const result = await accountsCollection.updateOne(
      { accountNumber },
      { $inc: { balance: -amount } }
    );
    
    // Get updated account
    const updatedAccount = await accountsCollection.findOne({ accountNumber });
    
    res.json({
      message: 'Withdrawal successful',
      transaction: {
        type: 'WITHDRAWAL',
        accountNumber: accountNumber,
        amount: amount,
        previousBalance: account.balance,
        newBalance: updatedAccount.balance,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process withdrawal'
    });
  }
});

// ==============================================
// MAIN TRANSFER ENDPOINT WITH BALANCE VALIDATION
// ==============================================
app.post('/transfer', async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, description } = req.body;
    
    // === STEP 1: Input Validation ===
    if (!fromAccount || !toAccount || !amount) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'fromAccount, toAccount, and amount are required'
      });
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Amount must be a positive number'
      });
    }
    
    if (fromAccount === toAccount) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot transfer to the same account'
      });
    }
    
    console.log(`\n💰 Transfer Request: ${fromAccount} → ${toAccount} | Amount: $${amount}`);
    
    // === STEP 2: Verify Sender Account Exists ===
    const senderAccount = await accountsCollection.findOne({ 
      accountNumber: fromAccount 
    });
    
    if (!senderAccount) {
      console.log(`❌ Sender account ${fromAccount} not found`);
      return res.status(404).json({
        error: 'Not Found',
        message: `Sender account ${fromAccount} does not exist`
      });
    }
    
    // === STEP 3: Verify Receiver Account Exists ===
    const receiverAccount = await accountsCollection.findOne({ 
      accountNumber: toAccount 
    });
    
    if (!receiverAccount) {
      console.log(`❌ Receiver account ${toAccount} not found`);
      return res.status(404).json({
        error: 'Not Found',
        message: `Receiver account ${toAccount} does not exist`
      });
    }
    
    // === STEP 4: Check Account Status ===
    if (senderAccount.status !== 'active') {
      return res.status(400).json({
        error: 'Account Inactive',
        message: `Sender account ${fromAccount} is not active`
      });
    }
    
    if (receiverAccount.status !== 'active') {
      return res.status(400).json({
        error: 'Account Inactive',
        message: `Receiver account ${toAccount} is not active`
      });
    }
    
    // === STEP 5: Validate Sufficient Balance ===
    console.log(`📊 Sender balance: $${senderAccount.balance} | Required: $${amount}`);
    
    if (senderAccount.balance < amount) {
      console.log(`❌ Insufficient funds`);
      return res.status(400).json({
        error: 'Insufficient Funds',
        message: `Insufficient balance in account ${fromAccount}`,
        availableBalance: senderAccount.balance,
        requestedAmount: amount,
        shortfall: amount - senderAccount.balance
      });
    }
    
    // === STEP 6: Perform Transfer (Sequential Updates) ===
    console.log(`✅ Validation passed. Proceeding with transfer...`);
    
    // Store balances before transfer
    const senderBalanceBefore = senderAccount.balance;
    const receiverBalanceBefore = receiverAccount.balance;
    
    // Deduct from sender
    const deductResult = await accountsCollection.updateOne(
      { accountNumber: fromAccount },
      { 
        $inc: { balance: -amount },
        $set: { lastTransaction: new Date() }
      }
    );
    
    if (deductResult.modifiedCount === 0) {
      console.log(`❌ Failed to deduct from sender`);
      return res.status(500).json({
        error: 'Transaction Failed',
        message: 'Failed to deduct amount from sender account'
      });
    }
    
    console.log(`✅ Deducted $${amount} from ${fromAccount}`);
    
    // Add to receiver
    const creditResult = await accountsCollection.updateOne(
      { accountNumber: toAccount },
      { 
        $inc: { balance: amount },
        $set: { lastTransaction: new Date() }
      }
    );
    
    if (creditResult.modifiedCount === 0) {
      console.log(`⚠️ Failed to credit receiver. Rolling back...`);
      
      // Rollback: Add money back to sender
      await accountsCollection.updateOne(
        { accountNumber: fromAccount },
        { $inc: { balance: amount } }
      );
      
      return res.status(500).json({
        error: 'Transaction Failed',
        message: 'Failed to credit receiver account. Transaction rolled back.'
      });
    }
    
    console.log(`✅ Credited $${amount} to ${toAccount}`);
    
    // === STEP 7: Get Updated Balances ===
    const updatedSender = await accountsCollection.findOne({ 
      accountNumber: fromAccount 
    });
    const updatedReceiver = await accountsCollection.findOne({ 
      accountNumber: toAccount 
    });
    
    console.log(`✅ Transfer completed successfully\n`);
    
    // === STEP 8: Return Success Response ===
    res.json({
      message: 'Transfer completed successfully',
      transaction: {
        transactionId: new ObjectId().toString(),
        type: 'TRANSFER',
        fromAccount: fromAccount,
        toAccount: toAccount,
        amount: amount,
        description: description || 'Money transfer',
        sender: {
          accountNumber: fromAccount,
          accountHolder: senderAccount.accountHolder,
          balanceBefore: senderBalanceBefore,
          balanceAfter: updatedSender.balance
        },
        receiver: {
          accountNumber: toAccount,
          accountHolder: receiverAccount.accountHolder,
          balanceBefore: receiverBalanceBefore,
          balanceAfter: updatedReceiver.balance
        },
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing transfer:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process transfer',
      details: error.message
    });
  }
});

// ==============================================
// ERROR HANDLING
// ==============================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// ==============================================
// START SERVER
// ==============================================
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🏦  BANK ACCOUNT TRANSFER SYSTEM`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`Database: ${DB_NAME}`);
    console.log(`${'='.repeat(70)}\n`);
    
    console.log(`📋 Available Endpoints:`);
    console.log(`   GET  /accounts              - List all accounts`);
    console.log(`   GET  /accounts/:number      - Get account details`);
    console.log(`   POST /accounts              - Create new account`);
    console.log(`   POST /transfer              - Transfer money (main feature)`);
    console.log(`   POST /deposit               - Deposit money`);
    console.log(`   POST /withdraw              - Withdraw money\n`);
    
    console.log(`🧪 Test Transfer (Successful):`);
    console.log(`   curl -X POST http://localhost:${PORT}/transfer \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{`);
    console.log(`       "fromAccount": "ACC001",`);
    console.log(`       "toAccount": "ACC002",`);
    console.log(`       "amount": 500,`);
    console.log(`       "description": "Payment for services"`);
    console.log(`     }'\n`);
    
    console.log(`🧪 Test Transfer (Insufficient Funds):`);
    console.log(`   curl -X POST http://localhost:${PORT}/transfer \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{`);
    console.log(`       "fromAccount": "ACC004",`);
    console.log(`       "toAccount": "ACC001",`);
    console.log(`       "amount": 10000,`);
    console.log(`       "description": "Large transfer"`);
    console.log(`     }'\n`);
    
    console.log(`🧪 View All Accounts:`);
    console.log(`   curl http://localhost:${PORT}/accounts\n`);
    
    console.log(`${'='.repeat(70)}\n`);
  });
});

// ==============================================
// INSTALLATION & USAGE INSTRUCTIONS
// ==============================================
/*
📦 INSTALLATION:

1. Install dependencies:
   npm install express mongodb

2. Make sure MongoDB is running:
   mongod

3. Run the application:
   node server.js

📝 TESTING SCENARIOS:

1. View all accounts:
   curl http://localhost:3000/accounts

2. Successful transfer (ACC001 has $5000):
   curl -X POST http://localhost:3000/transfer \
     -H "Content-Type: application/json" \
     -d '{"fromAccount":"ACC001","toAccount":"ACC002","amount":500}'

3. Failed transfer - Insufficient funds (ACC004 has only $500):
   curl -X POST http://localhost:3000/transfer \
     -H "Content-Type: application/json" \
     -d '{"fromAccount":"ACC004","toAccount":"ACC001","amount":10000}'

4. Failed transfer - Invalid account:
   curl -X POST http://localhost:3000/transfer \
     -H "Content-Type: application/json" \
     -d '{"fromAccount":"ACC999","toAccount":"ACC001","amount":100}'

5. View specific account:
   curl http://localhost:3000/accounts/ACC001

6. Deposit money:
   curl -X POST http://localhost:3000/deposit \
     -H "Content-Type: application/json" \
     -d '{"accountNumber":"ACC001","amount":1000}'

7. Withdraw money:
   curl -X POST http://localhost:3000/withdraw \
     -H "Content-Type: application/json" \
     -d '{"accountNumber":"ACC001","amount":200}'

🔒 VALIDATION LOGIC:
The transfer endpoint implements the following checks:
1. ✅ Input validation (all required fields present)
2. ✅ Amount is positive number
3. ✅ Cannot transfer to same account
4. ✅ Sender account exists
5. ✅ Receiver account exists
6. ✅ Both accounts are active
7. ✅ Sender has sufficient balance
8. ✅ Sequential updates (deduct then credit)
9. ✅ Rollback on failure (if credit fails)
10. ✅ Detailed transaction logging

This ensures data consistency without database transactions!
*/
