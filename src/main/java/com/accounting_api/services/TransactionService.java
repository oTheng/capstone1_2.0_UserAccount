package com.accounting_api.services;

import com.accounting_api.models.Transaction;
import com.accounting_api.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    // Get all transactions
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // Get transaction by ID
    public Transaction getTransactionById(Integer id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found."));
    }

    // Add transaction
    public Transaction addTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    // Update transaction
    public Transaction updateTransaction(Integer id, Transaction updatedTransaction) {

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found."));

        transaction.setTransactionDate(updatedTransaction.getTransactionDate());
        transaction.setTransactionTime(updatedTransaction.getTransactionTime());
        transaction.setDescription(updatedTransaction.getDescription());
        transaction.setVendor(updatedTransaction.getVendor());
        transaction.setAmount(updatedTransaction.getAmount());
        transaction.setTransactionType(updatedTransaction.getTransactionType());

        return transactionRepository.save(transaction);
    }

    // Delete transaction
    public void deleteTransaction(Integer id) {
        transactionRepository.deleteById(id);
    }

    // Get deposits only
    public List<Transaction> getDeposits() {
        return transactionRepository.findByTransactionType("DEPOSIT");
    }

    // Get payments only
    public List<Transaction> getPayments() {
        return transactionRepository.findByTransactionType("PAYMENT");
    }

    // Search by vendor
    public List<Transaction> searchByVendor(String vendor) {
        return transactionRepository.findByVendorContainingIgnoreCase(vendor);
    }
}
