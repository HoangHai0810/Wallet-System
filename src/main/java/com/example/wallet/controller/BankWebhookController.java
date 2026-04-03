package com.example.wallet.controller;

import com.example.wallet.dto.SepayWebhookRequest;
import com.example.wallet.service.BankTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@Slf4j
public class BankWebhookController {

    private final BankTransactionService bankTransactionService;

    @PostMapping("/sepay")
    public ResponseEntity<Map<String, Boolean>> receiveSepayWebhook(
            @RequestBody SepayWebhookRequest request) {
        log.info("Received SePay webhook: {} - {}đ from {}",
                request.getTransferType(), request.getTransferAmount(), request.getGateway());
        bankTransactionService.processWebhook(request);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
