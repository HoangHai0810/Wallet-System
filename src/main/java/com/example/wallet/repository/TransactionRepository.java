package com.example.wallet.repository;

import com.example.wallet.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
        boolean existsByIdempotencyKey(String idempotencyKey);

        Optional<Transaction> findByIdempotencyKey(String key);

        Page<Transaction> findByFromWalletIdOrToWalletId(Long fromId, Long toId, Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t WHERE (t.fromWalletId = :walletId OR t.toWalletId = :walletId) "
                        +
                        "AND (:startDate IS NULL OR t.createdAt >= :startDate) " +
                        "AND (:endDate IS NULL OR t.createdAt <= :endDate)")
        Page<Transaction> findByWalletAndDateRange(
                        @org.springframework.data.repository.query.Param("walletId") Long walletId,
                        @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
                        @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate,
                        Pageable pageable);
}
