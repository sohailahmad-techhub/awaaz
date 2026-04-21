const crypto = require('crypto');
const Transaction = require('../models/Transaction');

/**
 * Generates a SHA-256 hash for a new "block" (transaction) in the ledger.
 * This links the current transaction to the absolute state of the ledger.
 */
function calculateBlockHash(prevHash, transactionData) {
  const dataString = prevHash + JSON.stringify(transactionData);
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Formalizes a transaction into the "blockchain" ledger.
 * It finds the latest transaction, gets its hash, and chains the new one.
 */
async function chainTransaction(transaction) {
  try {
    // 1. Get the most recent confirmed transaction's blockHash
    const lastTx = await Transaction.findOne({ status: 'completed' })
      .sort({ createdAt: -1 });
    
    const prevHash = lastTx ? lastTx.blockHash : '0'.repeat(64); // Genesis hash if first
    
    // 2. Prepare data for hashing
    const dataToHash = {
      amount: transaction.amount,
      projectId: transaction.projectId.toString(),
      ngoId: transaction.ngoId.toString(),
      stripeSessionId: transaction.stripeSessionId,
      timestamp: transaction.timestamp
    };
    
    // 3. Calculate new block hash
    const blockHash = calculateBlockHash(prevHash, dataToHash);
    
    // 4. Update the transaction with the chain data
    transaction.prevHash = prevHash;
    transaction.blockHash = blockHash;
    transaction.status = 'completed';
    
    await transaction.save();
    
    console.log(`[Ledger] Transaction Chained: ${blockHash.slice(0, 10)}...`);
    return transaction;
  } catch (error) {
    console.error('[Ledger] Chaining failed:', error);
    throw error;
  }
}

/**
 * Validates the entire ledger integrity.
 * (Optional utility for transparency audits)
 */
async function verifyLedgerIntegrity() {
  const txs = await Transaction.find({ status: 'completed' }).sort({ createdAt: 1 });
  let currentPrevHash = '0'.repeat(64);
  
  for (const tx of txs) {
    const dataToHash = {
      amount: tx.amount,
      projectId: tx.projectId.toString(),
      ngoId: tx.ngoId.toString(),
      stripeSessionId: tx.stripeSessionId,
      timestamp: tx.timestamp
    };
    
    const expectedHash = calculateBlockHash(currentPrevHash, dataToHash);
    
    if (tx.blockHash !== expectedHash) {
      return { valid: false, corruptedTxId: tx._id };
    }
    
    currentPrevHash = tx.blockHash;
  }
  
  return { valid: true };
}

module.exports = { calculateBlockHash, chainTransaction, verifyLedgerIntegrity };
