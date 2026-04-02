package com.example.wallet.controller;

import com.example.wallet.service.WalletService;
import com.example.wallet.util.HmacUtil;
import com.example.wallet.dto.transaction.TransactionRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor 
public class PaymentWebhookController {

    private final WalletService walletService;

    @Value("${momo.secret-key}")
    private String secretKey;

    @PostMapping("/momo")
    public ResponseEntity<?> momoPayment(
            @RequestHeader("X-Signature") String signature,
            @Valid @RequestBody TransactionRequest request) {

        try {
            String dataToSign = request.getTransactionId() + "|" + request.getStatus();

            String calculatedSignature = HmacUtil.calculateHmac(dataToSign, secretKey);

            if (!calculatedSignature.equals(signature)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid Signature!");
            }

            return ResponseEntity.ok(walletService.processWebhook(
                    request.getTransactionId(),
                    request.getStatus()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
