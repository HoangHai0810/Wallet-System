package com.example.wallet.event;

import org.springframework.stereotype.Component;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import com.example.wallet.config.RabbitMQConfig;

@Component
public class NotificationListener {

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void handleTransferSuccess(TransferSuccessEvent event) {
        System.out.println("Processing notification for transfer: " + event.getAmount()
                + " from " + event.getFromWalletId() + " to " + event.getToWalletId());

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("Notification sent!");
    }
}
