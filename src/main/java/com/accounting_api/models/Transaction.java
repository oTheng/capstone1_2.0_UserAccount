package com.accounting_api.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    @Column(name = "transaction_time")
    private LocalTime transactionTime;

    private String description;

    private String vendor;

    private BigDecimal amount;

    @Column(name = "transaction_type")
    private String transactionType;

    public Transaction() {
    }

    public Transaction(Integer id, LocalDate transactionDate, LocalTime transactionTime,
                       String description, String vendor,
                       BigDecimal amount, String transactionType) {
        this.id = id;
        this.transactionDate = transactionDate;
        this.transactionTime = transactionTime;
        this.description = description;
        this.vendor = vendor;
        this.amount = amount;
        this.transactionType = transactionType;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public LocalTime getTransactionTime() {
        return transactionTime;
    }

    public void setTransactionTime(LocalTime transactionTime) {
        this.transactionTime = transactionTime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVendor() {
        return vendor;
    }

    public void setVendor(String vendor) {
        this.vendor = vendor;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }
}
