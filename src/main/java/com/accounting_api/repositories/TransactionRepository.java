package com.accounting_api.repositories;

import com.accounting_api.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    List<Transaction> findByTransactionType(String transactionType);

    List<Transaction> findByVendorContainingIgnoreCase(String vendor);

}
