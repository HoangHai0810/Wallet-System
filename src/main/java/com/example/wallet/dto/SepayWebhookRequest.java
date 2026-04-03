package com.example.wallet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SepayWebhookRequest {
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String transferType;  
    private Long transferAmount;
    private Long accumulated;
    private String code;
    private String content;
    @JsonProperty("referenceCode")
    private String referenceNumber;
}
