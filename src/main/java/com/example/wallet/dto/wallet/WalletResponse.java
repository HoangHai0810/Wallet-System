package com.example.wallet.dto.wallet;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class WalletResponse {
    private Long id;
    private BigDecimal balance;
}