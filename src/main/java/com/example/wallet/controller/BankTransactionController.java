package com.example.wallet.controller;

import com.example.wallet.entity.BankTransaction;
import com.example.wallet.repository.BankTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bank-transactions")
@RequiredArgsConstructor
public class BankTransactionController {

    private final BankTransactionRepository bankTransactionRepository;

    @GetMapping
    public ResponseEntity<Page<BankTransaction>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate"));
        Page<BankTransaction> transactions = bankTransactionRepository.findAll(pageable);
        
        return ResponseEntity.ok(transactions);
    }
}
