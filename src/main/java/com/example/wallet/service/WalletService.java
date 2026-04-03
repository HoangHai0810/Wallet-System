package com.example.wallet.service;

import com.example.wallet.entity.User;
import com.example.wallet.entity.Wallet;
import com.example.wallet.entity.Transaction;
import com.example.wallet.dto.wallet.WalletResponse;
import com.example.wallet.dto.wallet.WalletRequest;
import com.example.wallet.dto.wallet.TransferRequest;
import com.example.wallet.repository.UserRepository;
import com.example.wallet.repository.WalletRepository;
import com.example.wallet.repository.TransactionRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import com.example.wallet.event.TransferSuccessEvent;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final MeterRegistry meterRegistry;
    private final org.redisson.api.RedissonClient redissonClient;
    private final org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;

    @Cacheable(value = "wallet", key = "#root.target.getCurrentUserEmail()")
    public WalletResponse getMyWallet() {
        Wallet wallet = getCurrentUserWallet(false);
        return new WalletResponse(wallet.getId(), wallet.getBalance(), wallet.getUser().getPhoneNumber());
    }

    @Transactional
    @CacheEvict(value = "wallet", key = "#root.target.getCurrentUserEmail()")
    public WalletResponse deposit(WalletRequest request) {
        Wallet wallet = getCurrentUserWallet(true);
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        meterRegistry.counter("wallet.deposit.success").increment();

        return new WalletResponse(wallet.getId(), wallet.getBalance(), wallet.getUser().getPhoneNumber());
    }

    @Transactional
    @CacheEvict(value = "wallet", key = "#root.target.getCurrentUserEmail()")
    public WalletResponse withdraw(WalletRequest request) {
        Wallet wallet = getCurrentUserWallet(true);
        BigDecimal amount = request.getAmount();

        if (wallet.getBalance().compareTo(amount) < 0) {
            meterRegistry.counter("wallet.withdraw.fail").increment();
            throw new RuntimeException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        meterRegistry.counter("wallet.withdraw.success").increment();

        return new WalletResponse(wallet.getId(), wallet.getBalance(), wallet.getUser().getPhoneNumber());
    }

    @Transactional
    @CacheEvict(value = "wallet", allEntries = true)
    public WalletResponse transfer(TransferRequest request, String idempotencyKey) {
        Long fromId = getCurrentUserWallet(false).getId();
        Long toId;
        if (request.getToPhoneNumber() != null) {
            Wallet toWallet = walletRepository.findByPhoneNumber(request.getToPhoneNumber())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));
            toId = toWallet.getId();
        } else {
            toId = request.getToWalletId();
        }

        if (toId == null) {
            throw new RuntimeException("Recipient information (ID or Phone) is required!");
        }

        if (fromId.equals(toId)) {
            throw new RuntimeException("Cannot transfer to yourself");
        }

        BigDecimal amount = request.getAmount();

        Long first = Math.min(fromId, toId);
        Long second = Math.max(fromId, toId);

        org.redisson.api.RLock lock1 = redissonClient.getLock("wallet:lock:" + first);
        org.redisson.api.RLock lock2 = redissonClient.getLock("wallet:lock:" + second);

        try {
            if (lock1.tryLock(10, 5, java.util.concurrent.TimeUnit.SECONDS) &&
                    lock2.tryLock(10, 5, java.util.concurrent.TimeUnit.SECONDS)) {

                Wallet fromWallet = walletRepository.findById(fromId)
                        .orElseThrow(() -> new RuntimeException("Wallet not found"));

                if (fromWallet.getBalance().compareTo(amount) < 0) {
                    throw new RuntimeException("Balance not enough");
                }
                // Check Idempotency
                Optional<Transaction> existingTx = transactionRepository.findByIdempotencyKey(idempotencyKey);
                if (existingTx.isPresent()) {
                    return new WalletResponse(fromWallet.getId(), fromWallet.getBalance(), fromWallet.getUser().getPhoneNumber());
                }

                Wallet toWallet = walletRepository.findById(toId)
                        .orElseThrow(() -> new RuntimeException("Recipient wallet not found"));

                // set balance
                fromWallet.setBalance(fromWallet.getBalance().subtract(amount));
                toWallet.setBalance(toWallet.getBalance().add(amount));

                walletRepository.save(fromWallet);
                walletRepository.save(toWallet);

                // save transaction
                Transaction tx = Transaction.builder()
                        .fromWalletId(fromWallet.getId())
                        .toWalletId(toWallet.getId())
                        .amount(amount)
                        .category(request.getCategory())
                        .idempotencyKey(idempotencyKey)
                        .type("TRANSFER")
                        .status("SUCCESS")
                        .build();
                transactionRepository.save(tx);

                meterRegistry.counter("wallet.transfer.success").increment();

                rabbitTemplate.convertAndSend(
                        com.example.wallet.config.RabbitMQConfig.EXCHANGE,
                        com.example.wallet.config.RabbitMQConfig.ROUTING_KEY,
                        new TransferSuccessEvent(fromId, toId, amount));

                return new WalletResponse(fromWallet.getId(), fromWallet.getBalance(), fromWallet.getUser().getPhoneNumber());
            } else {
                throw new RuntimeException("System Error, Please Try Later!");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Transaction is interupt!");
        } finally {
            if (lock1.isHeldByCurrentThread())
                lock1.unlock();
            if (lock2.isHeldByCurrentThread())
                lock2.unlock();
        }
    }

    public Page<Transaction> getHistory(int page, int size, java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate) {
        Wallet wallet = getCurrentUserWallet(false);
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return transactionRepository.findByWalletAndDateRange(wallet.getId(), startDate, endDate, pageable);
    }

    @Transactional
    public Long createPendingDeposit(BigDecimal amount) {
        Wallet wallet = getCurrentUserWallet(false);
        Transaction tx = Transaction.builder()
                .toWalletId(wallet.getId())
                .amount(amount)
                .type("DEPOSIT_WEBHOOK")
                .status("PENDING")
                .build();
        transactionRepository.save(tx);
        return tx.getId();
    }

    @Transactional
    @CacheEvict(value = "wallet", allEntries = true)
    public WalletResponse processWebhook(Long transactionId, String status) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if ("SUCCESS".equals(tx.getStatus())) {
            return getWalletResponse(tx.getToWalletId());
        }

        if ("SUCCESS".equals(status)) {
            Wallet wallet = walletRepository.findByIdWithLock(tx.getToWalletId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            wallet.setBalance(wallet.getBalance().add(tx.getAmount()));
            walletRepository.save(wallet);

            tx.setStatus("SUCCESS");
            transactionRepository.save(tx);

            return new WalletResponse(wallet.getId(), wallet.getBalance(), wallet.getUser().getPhoneNumber());
        }

        tx.setStatus("FAILED");
        transactionRepository.save(tx);
        return getWalletResponse(tx.getToWalletId());
    }

    private Wallet getCurrentUserWallet(boolean lock) {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return (lock ? walletRepository.findByUser_IdWithLock(user.getId())
                : walletRepository.findByUser_Id(user.getId()))
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + email));
    }

    private WalletResponse getWalletResponse(Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found: " + walletId));
        return new WalletResponse(wallet.getId(), wallet.getBalance(), wallet.getUser().getPhoneNumber());
    }

    public String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    
    @Transactional
    @CacheEvict(value = "wallet", allEntries = true)
    public void topUpFromBank(String phoneNumber, BigDecimal amount) {
        Wallet wallet = walletRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("Wallet not found for phone: " + phoneNumber));

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .fromWalletId(null) 
                .toWalletId(wallet.getId())
                .amount(amount)
                .type("DEPOSIT")
                .status("SUCCESS")
                .category("BANK_TRANSFER")
                .build();
        transactionRepository.save(transaction);
        meterRegistry.counter("wallet.deposit.bank").increment();
    }
}
