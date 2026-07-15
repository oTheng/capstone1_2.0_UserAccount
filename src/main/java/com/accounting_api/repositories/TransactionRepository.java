package com.accounting_api.repositories;

import com.accounting_api.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    List<Transaction> findByUserId(Integer userId);

    List<Transaction> findByUserIdAndTransactionType(Integer userId, String transactionType);

    List<Transaction> findByUserIdAndVendorContainingIgnoreCase(Integer userId, String vendor);

}
