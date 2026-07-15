package com.accounting_api.services;

import com.accounting_api.models.Transaction;
import com.accounting_api.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    // Get all transactions belonging to this user
    public List<Transaction> getAllTransactions(Integer userId) {
        return transactionRepository.findByUserId(userId);
    }

    // Get one transaction — 404 if it doesn't exist OR belongs to someone else
    public Transaction getTransactionById(Integer id, Integer userId) {
        return getOwnedTransaction(id, userId);
    }

    // Add transaction — owner always comes from the token
    public Transaction addTransaction(Transaction transaction, Integer userId) {
        transaction.setId(null);
        transaction.setUserId(userId);
        return transactionRepository.save(transaction);
    }

    // Update transaction (only your own)
    public Transaction updateTransaction(Integer id, Transaction updatedTransaction, Integer userId) {

        Transaction transaction = getOwnedTransaction(id, userId);

        transaction.setTransactionDate(updatedTransaction.getTransactionDate());
        transaction.setTransactionTime(updatedTransaction.getTransactionTime());
        transaction.setDescription(updatedTransaction.getDescription());
        transaction.setVendor(updatedTransaction.getVendor());
        transaction.setAmount(updatedTransaction.getAmount());
        transaction.setTransactionType(updatedTransaction.getTransactionType());

        return transactionRepository.save(transaction);
    }

    // Delete transaction (only your own)
    public void deleteTransaction(Integer id, Integer userId) {
        Transaction transaction = getOwnedTransaction(id, userId);
        transactionRepository.delete(transaction);
    }

    // Get deposits only (this user)
    public List<Transaction> getDeposits(Integer userId) {
        return transactionRepository.findByUserIdAndTransactionType(userId, "DEPOSIT");
    }

    // Get payments only (this user)
    public List<Transaction> getPayments(Integer userId) {
        return transactionRepository.findByUserIdAndTransactionType(userId, "PAYMENT");
    }

    // Search by vendor (this user)
    public List<Transaction> searchByVendor(String vendor, Integer userId) {
        return transactionRepository.findByUserIdAndVendorContainingIgnoreCase(userId, vendor);
    }

    // Look up a transaction and make sure it belongs to this user.
    // Returns 404 (not 403) for someone else's transaction so ids can't be probed.
    private Transaction getOwnedTransaction(Integer id, Integer userId) {

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found."));

        if (!userId.equals(transaction.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found.");
        }

        return transaction;
    }
}
