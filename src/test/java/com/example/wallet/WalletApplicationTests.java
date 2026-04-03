package com.example.wallet;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class WalletApplicationTests {

    @MockitoBean
    private org.redisson.api.RedissonClient redissonClient;

	@Test
	void contextLoads() {
	}

}
