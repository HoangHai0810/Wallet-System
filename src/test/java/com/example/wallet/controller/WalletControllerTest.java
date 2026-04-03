package com.example.wallet.controller;

import com.example.wallet.dto.wallet.WalletResponse;
import com.example.wallet.service.WalletService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WalletService walletService;

    @MockitoBean
    private org.redisson.api.RedissonClient redissonClient;

    @Test
    @WithMockUser(username = "test@example.com")
    void getMyWallet_ShouldReturnWalletInfo_WhenAuthenticated() throws Exception {
        WalletResponse mockResponse = new WalletResponse(1L, new BigDecimal("1000.00"), "0905116043");
        when(walletService.getMyWallet()).thenReturn(mockResponse);

        mockMvc.perform(get("/wallet/my")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.balance").value(1000.00));
    }

    @Test
    void getMyWallet_ShouldReturn401_WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/wallet")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
