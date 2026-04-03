package com.example.wallet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gateway;
    private String accountNumber;
    private String transferType;
    private BigDecimal amount;
    private String content;

    @Column(name = "ai_category")
    private String aiCategory;

    private String referenceNumber; 
    
    @Column(name = "user_id")
    private Long userId;

    private String status;

    private LocalDateTime transactionDate;
    private LocalDateTime createdAt;
}
