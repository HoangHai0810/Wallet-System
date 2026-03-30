package com.example.wallet.event;

import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;

@Component
@Slf4j
public class NotificationListener {

    @Async
    @EventListener
    public void handleTransferSuccess(TransferSuccessEvent event) {
        log.info("🔥 [BÁO ĐỘNG] Ting Ting! Ví {} vừa nhận được {} VNĐ từ Ví {}",
                event.getToWalletId(), event.getAmount(), event.getFromWalletId());

        // Giả ngủ 3 giây để làm bộ đang gửi cục Email nặng nề
        try {
            Thread.sleep(3000);
        } catch (Exception e) {
        }
        log.info("✅ [BÁO ĐỘNG] Đã gửi thông báo Email thành công!");
    }
}
