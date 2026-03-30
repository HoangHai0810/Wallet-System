package com.example.wallet.event;
import lombok.AllArgsConstructor;
import lombok.Data;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;


@Data
@AllArgsConstructor
public class TransferSuccessEvent {
    @NotNull(message="fromWalletId is required")
    private Long fromWalletId;

    @NotNull(message="toWalletId is required")
    private Long toWalletId;

    @Positive(message="Amount is greater than 0!")
    private BigDecimal amount;
}
