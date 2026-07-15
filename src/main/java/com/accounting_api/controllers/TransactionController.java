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

    // The "userId" attribute is set by AuthInterceptor from the JWT,
    // so every endpoint below only ever sees the logged-in user's data.

    // GET - All Transactions (mine)
    @GetMapping
    public List<Transaction> getAllTransactions(@RequestAttribute("userId") Integer userId) {
        return transactionService.getAllTransactions(userId);
    }

    // GET - Transaction by ID (mine)
    @GetMapping("/{id}")
    public Transaction getTransactionById(@PathVariable Integer id,
                                          @RequestAttribute("userId") Integer userId) {
        return transactionService.getTransactionById(id, userId);
    }

    // POST - Add Transaction (owned by me)
    @PostMapping
    public Transaction addTransaction(@RequestBody Transaction transaction,
                                      @RequestAttribute("userId") Integer userId) {
        return transactionService.addTransaction(transaction, userId);
    }

    // PUT - Update Transaction (mine)
    @PutMapping("/{id}")
    public Transaction updateTransaction(@PathVariable Integer id,
                                         @RequestBody Transaction transaction,
                                         @RequestAttribute("userId") Integer userId) {
        return transactionService.updateTransaction(id, transaction, userId);
    }

    // DELETE - Delete Transaction (mine)
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Integer id,
                                  @RequestAttribute("userId") Integer userId) {
        transactionService.deleteTransaction(id, userId);
    }

    // GET - Deposits Only (mine)
    @GetMapping("/deposits")
    public List<Transaction> getDeposits(@RequestAttribute("userId") Integer userId) {
        return transactionService.getDeposits(userId);
    }

    // GET - Payments Only (mine)
    @GetMapping("/payments")
    public List<Transaction> getPayments(@RequestAttribute("userId") Integer userId) {
        return transactionService.getPayments(userId);
    }

    // GET - Search by Vendor (mine)
    @GetMapping("/vendor/{vendor}")
    public List<Transaction> searchByVendor(@PathVariable String vendor,
                                            @RequestAttribute("userId") Integer userId) {
        return transactionService.searchByVendor(vendor, userId);
    }
}
