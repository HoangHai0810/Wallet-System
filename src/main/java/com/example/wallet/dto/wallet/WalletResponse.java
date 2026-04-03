package com.example.wallet.dto.wallet;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private BigDecimal balance;
    private String phoneNumber;
}