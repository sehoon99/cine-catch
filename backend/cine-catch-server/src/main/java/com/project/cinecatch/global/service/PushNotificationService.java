package com.project.cinecatch.global.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class PushNotificationService {

    /**
     * 단일 사용자에게 푸시 알림 발송
     */
    public boolean sendToUser(String fcmToken, String title, String body) {
        if (!isFirebaseInitialized()) {
            log.warn("Firebase가 초기화되지 않았습니다. 푸시 알림을 발송할 수 없습니다.");
            return false;
        }

        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .setAndroidConfig(AndroidConfig.builder()
                            .setPriority(AndroidConfig.Priority.HIGH)
                            .setNotification(AndroidNotification.builder()
                                    .setSound("default")
                                    .build())
                            .build())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("푸시 알림 발송 성공: {}", response);
            return true;
        } catch (FirebaseMessagingException e) {
            log.error("푸시 알림 발송 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 여러 사용자에게 푸시 알림 발송
     */
    public int sendToUsers(List<String> fcmTokens, String title, String body) {
        if (!isFirebaseInitialized()) {
            log.warn("Firebase가 초기화되지 않았습니다. 푸시 알림을 발송할 수 없습니다.");
            return 0;
        }

        if (fcmTokens == null || fcmTokens.isEmpty()) {
            return 0;
        }

        try {
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(fcmTokens)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .setAndroidConfig(AndroidConfig.builder()
                            .setPriority(AndroidConfig.Priority.HIGH)
                            .setNotification(AndroidNotification.builder()
                                    .setSound("default")
                                    .build())
                            .build())
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            log.info("푸시 알림 발송 완료: 성공 {}, 실패 {}",
                    response.getSuccessCount(), response.getFailureCount());
            return response.getSuccessCount();
        } catch (FirebaseMessagingException e) {
            log.error("푸시 알림 다중 발송 실패: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * 이벤트 업데이트 알림 발송
     */
    public int sendEventUpdateNotification(List<String> fcmTokens, String theaterName, String eventTitle) {
        String title = "새 이벤트 알림";
        String body = String.format("%s에서 새 이벤트가 시작되었습니다: %s", theaterName, eventTitle);
        return sendToUsers(fcmTokens, title, body);
    }

    /**
     * 이벤트 재고 상태 변경 알림 발송
     */
    public int sendStockUpdateNotification(List<String> fcmTokens, String theaterName, String eventTitle, String newStatus) {
        String title = "이벤트 상태 변경";
        String body = String.format("%s - %s 상태가 [%s](으)로 변경되었습니다", theaterName, eventTitle, newStatus);
        return sendToUsers(fcmTokens, title, body);
    }

    private boolean isFirebaseInitialized() {
        return !FirebaseApp.getApps().isEmpty();
    }
}
