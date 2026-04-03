package com.example.wallet.service;

import com.example.wallet.dto.SepayWebhookRequest;
import com.example.wallet.entity.BankTransaction;
import com.example.wallet.repository.BankTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class BankTransactionService {

    private final BankTransactionRepository bankTransactionRepository;
    private final WalletService walletService;
    private final com.example.wallet.repository.UserRepository userRepository;

    public void processWebhook(SepayWebhookRequest request) {
        if (bankTransactionRepository.findByReferenceNumber(request.getReferenceNumber()).isPresent()) {
            log.warn("Duplicate transaction: {}", request.getReferenceNumber());
            return;
        }

        BankTransaction transaction = BankTransaction.builder()
                .gateway(request.getGateway())
                .accountNumber(request.getAccountNumber())
                .transferType(request.getTransferType())
                .amount(BigDecimal.valueOf(request.getTransferAmount()))
                .content(request.getContent())
                .referenceNumber(request.getReferenceNumber())
                .aiCategory("UNCATEGORIZED")
                .transactionDate(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .status("PENDING")
                .build();

        if ("in".equalsIgnoreCase(request.getTransferType()) && request.getContent() != null) {
            String content = request.getContent().toUpperCase();
            if (content.contains("NAPTIEN")) {
                try {
                    String[] parts = content.split("\\s+");
                    String phone = null;
                    for (int i = 0; i < parts.length; i++) {
                        if (parts[i].equals("NAPTIEN") && i + 1 < parts.length) {
                            phone = parts[i+1];
                            break;
                        }
                    }
                    
                    if (phone != null) {
                        walletService.topUpFromBank(phone, BigDecimal.valueOf(request.getTransferAmount()));

                        userRepository.findByPhoneNumber(phone)
                            .ifPresent(u -> transaction.setUserId(u.getId()));
                            
                        transaction.setStatus("SUCCESS");
                        log.info("Auto top-up success for phone: {}", phone);
                    } else {
                        transaction.setStatus("FAILED");
                    }
                } catch (Exception e) {
                    log.error("Top-up failed for {}", request.getReferenceNumber(), e);
                    transaction.setStatus("FAILED");
                }
            } else {
                 transaction.setStatus("IGNORED");
            }
        }

        bankTransactionRepository.save(transaction);
        log.info("Saved bank transaction: {} - {}đ", request.getReferenceNumber(), request.getTransferAmount());
    }
}
