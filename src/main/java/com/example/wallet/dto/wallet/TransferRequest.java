package com.example.wallet.dto.wallet;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransferRequest {
    @NotNull(message = "Wallet's ID is required!")
    private Long toWalletId;

    @NotNull(message = "Amount is required!")
    @Positive(message = "Amount need greater than 0!")
    private BigDecimal amount;
}
