package com.example.wallet.service;

import com.example.wallet.dto.wallet.TransferRequest;
import com.example.wallet.dto.wallet.WalletResponse;
import com.example.wallet.entity.User;
import com.example.wallet.entity.Wallet;
import com.example.wallet.event.TransferSuccessEvent;
import com.example.wallet.repository.TransactionRepository;
import com.example.wallet.repository.UserRepository;
import com.example.wallet.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private io.micrometer.core.instrument.MeterRegistry meterRegistry;
    @Mock
    private io.micrometer.core.instrument.Counter counter;

    @InjectMocks
    private WalletService walletService;

    @Test
    void transfer_ShouldThrowError_WhenBalanceNotEnough() {
        String currentEmail = "test@example.com";
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(currentEmail);
        SecurityContextHolder.setContext(securityContext);

        User sender = User.builder().id(1L).email(currentEmail).build();
        Wallet senderWallet = Wallet.builder().id(1L).user(sender).balance(new BigDecimal("100")).build();

        TransferRequest request = new TransferRequest();
        request.setToWalletId(2L);
        request.setAmount(new BigDecimal("500"));
        String idempotencyKey = "test-key";

        when(userRepository.findByEmail(currentEmail)).thenReturn(Optional.of(sender));
        when(walletRepository.findByUser_IdWithLock(1L)).thenReturn(Optional.of(senderWallet));
        when(meterRegistry.counter(anyString())).thenReturn(counter);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            walletService.transfer(request, idempotencyKey);
        });

        assertEquals("Insufficient balance", exception.getMessage());

        verify(walletRepository, never()).save(any());
        verify(counter, times(1)).increment();
    }

    @Test
    void transfer_ShouldSucceed_WhenEverythingIsValid() {
        String currentEmail = "sender@example.com";
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(currentEmail);
        SecurityContextHolder.setContext(securityContext);

        User sender = User.builder().id(1L).email(currentEmail).build();
        Wallet senderWallet = Wallet.builder().id(1L).user(sender).balance(new BigDecimal("1000")).build();
        Wallet receiverWallet = Wallet.builder().id(2L).balance(new BigDecimal("500")).build();

        TransferRequest request = new TransferRequest();
        request.setToWalletId(2L);
        request.setAmount(new BigDecimal("200"));
        String idempotencyKey = "new-key";

        when(userRepository.findByEmail(currentEmail)).thenReturn(Optional.of(sender));
        when(walletRepository.findByUser_IdWithLock(1L)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByIdWithLock(2L)).thenReturn(Optional.of(receiverWallet));
        when(transactionRepository.findByIdempotencyKey(idempotencyKey)).thenReturn(Optional.empty());
        when(meterRegistry.counter(anyString())).thenReturn(counter);

        WalletResponse response = walletService.transfer(request, idempotencyKey);

        assertEquals(new BigDecimal("800"), response.getBalance());
        assertEquals(new BigDecimal("800"), senderWallet.getBalance());
        assertEquals(new BigDecimal("700"), receiverWallet.getBalance());

        verify(walletRepository, times(2)).save(any());
        verify(transactionRepository, times(1)).save(any());
        verify(eventPublisher, times(1)).publishEvent(any(TransferSuccessEvent.class));
        verify(counter, times(1)).increment();
    }
}
