package com.accounting_api.controllers;

import com.accounting_api.models.Transaction;
import com.accounting_api.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    // GET - All Transactions
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    // GET - Transaction by ID
    @GetMapping("/{id}")
    public Transaction getTransactionById(@PathVariable Integer id) {
        return transactionService.getTransactionById(id);
    }

    // POST - Add Transaction
    @PostMapping
    public Transaction addTransaction(@RequestBody Transaction transaction) {
        return transactionService.addTransaction(transaction);
    }

    // PUT - Update Transaction
    @PutMapping("/{id}")
    public Transaction updateTransaction(@PathVariable Integer id,
                                         @RequestBody Transaction transaction) {
        return transactionService.updateTransaction(id, transaction);
    }

    // DELETE - Delete Transaction
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Integer id) {
        transactionService.deleteTransaction(id);
    }

    // GET - Deposits Only
    @GetMapping("/deposits")
    public List<Transaction> getDeposits() {
        return transactionService.getDeposits();
    }

    // GET - Payments Only
    @GetMapping("/payments")
    public List<Transaction> getPayments() {
        return transactionService.getPayments();
    }

    // GET - Search by Vendor
    @GetMapping("/vendor/{vendor}")
    public List<Transaction> searchByVendor(@PathVariable String vendor) {
        return transactionService.searchByVendor(vendor);
    }
}