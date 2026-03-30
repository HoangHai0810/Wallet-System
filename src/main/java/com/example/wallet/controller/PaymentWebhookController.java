package com.example.wallet.controller;

import com.example.wallet.service.WalletService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.example.wallet.dto.wallet.WalletResponse;
import com.example.wallet.dto.wallet.WalletRequest;
import com.example.wallet.dto.transaction.TransactionRequest;
import lombok.AllArgsConstructor;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/webhooks")
@AllArgsConstructor
public class PaymentWebhookController {
    private final WalletService walletService;

    @PostMapping("/deposit/init")
    public ResponseEntity<Long> initDeposit(@Valid @RequestBody WalletRequest request) {
        return ResponseEntity.ok(walletService.createPendingDeposit(request.getAmount()));
    }

    @PostMapping("/momo")
    public ResponseEntity<WalletResponse> momoPayment(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(walletService.processWebhook(
                request.getTransactionId(),
                request.getStatus()));
    }

}
