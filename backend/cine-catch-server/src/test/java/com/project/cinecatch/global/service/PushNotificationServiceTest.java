package com.project.cinecatch.global.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PushNotificationServiceTest {

    @InjectMocks
    private PushNotificationService pushNotificationService;

    @Test
    void sendToUser_성공() throws Exception {
        try (MockedStatic<FirebaseApp> firebaseAppMock = mockStatic(FirebaseApp.class);
             MockedStatic<FirebaseMessaging> firebaseMessagingMock = mockStatic(FirebaseMessaging.class)) {

            firebaseAppMock.when(FirebaseApp::getApps).thenReturn(List.of(mock(FirebaseApp.class)));

            FirebaseMessaging messaging = mock(FirebaseMessaging.class);
            firebaseMessagingMock.when(FirebaseMessaging::getInstance).thenReturn(messaging);
            when(messaging.send(any(Message.class))).thenReturn("projects/test/messages/123");

            boolean result = pushNotificationService.sendToUser("test-token", "제목", "내용");

            assertThat(result).isTrue();
            verify(messaging).send(any(Message.class));
        }
    }

    @Test
    void sendToUser_Firebase_미초기화시_false_반환() {
        try (MockedStatic<FirebaseApp> firebaseAppMock = mockStatic(FirebaseApp.class)) {
            firebaseAppMock.when(FirebaseApp::getApps).thenReturn(List.of());

            boolean result = pushNotificationService.sendToUser("test-token", "제목", "내용");

            assertThat(result).isFalse();
        }
    }

    @Test
    void sendToUsers_성공_및_무효토큰_감지() throws Exception {
        try (MockedStatic<FirebaseApp> firebaseAppMock = mockStatic(FirebaseApp.class);
             MockedStatic<FirebaseMessaging> firebaseMessagingMock = mockStatic(FirebaseMessaging.class)) {

            firebaseAppMock.when(FirebaseApp::getApps).thenReturn(List.of(mock(FirebaseApp.class)));

            FirebaseMessaging messaging = mock(FirebaseMessaging.class);
            firebaseMessagingMock.when(FirebaseMessaging::getInstance).thenReturn(messaging);

            // 성공 응답
            SendResponse successResponse = mock(SendResponse.class);
            when(successResponse.isSuccessful()).thenReturn(true);

            // 실패 응답 (UNREGISTERED)
            SendResponse failResponse = mock(SendResponse.class);
            when(failResponse.isSuccessful()).thenReturn(false);
            FirebaseMessagingException exception = mock(FirebaseMessagingException.class);
            when(exception.getMessagingErrorCode()).thenReturn(MessagingErrorCode.UNREGISTERED);
            when(failResponse.getException()).thenReturn(exception);

            BatchResponse batchResponse = mock(BatchResponse.class);
            when(batchResponse.getSuccessCount()).thenReturn(1);
            when(batchResponse.getFailureCount()).thenReturn(1);
            when(batchResponse.getResponses()).thenReturn(List.of(successResponse, failResponse));

            when(messaging.sendEachForMulticast(any(MulticastMessage.class))).thenReturn(batchResponse);

            List<String> tokens = List.of("valid-token", "invalid-token");
            PushNotificationService.SendResult result = pushNotificationService.sendToUsers(tokens, "제목", "내용");

            assertThat(result.successCount()).isEqualTo(1);
            assertThat(result.invalidTokens()).containsExactly("invalid-token");
        }
    }

    @Test
    void sendToUsers_빈_토큰리스트() {
        PushNotificationService.SendResult result = pushNotificationService.sendToUsers(List.of(), "제목", "내용");

        assertThat(result.successCount()).isEqualTo(0);
        assertThat(result.invalidTokens()).isEmpty();
    }

    @Test
    void sendToUsers_null_토큰리스트() {
        PushNotificationService.SendResult result = pushNotificationService.sendToUsers(null, "제목", "내용");

        assertThat(result.successCount()).isEqualTo(0);
        assertThat(result.invalidTokens()).isEmpty();
    }

    @Test
    void sendToUsers_Firebase_미초기화시_빈_결과_반환() {
        try (MockedStatic<FirebaseApp> firebaseAppMock = mockStatic(FirebaseApp.class)) {
            firebaseAppMock.when(FirebaseApp::getApps).thenReturn(List.of());

            PushNotificationService.SendResult result =
                    pushNotificationService.sendToUsers(List.of("token"), "제목", "내용");

            assertThat(result.successCount()).isEqualTo(0);
            assertThat(result.invalidTokens()).isEmpty();
        }
    }

    @Test
    void sendToUsers_INVALID_ARGUMENT_에러코드_감지() throws Exception {
        try (MockedStatic<FirebaseApp> firebaseAppMock = mockStatic(FirebaseApp.class);
             MockedStatic<FirebaseMessaging> firebaseMessagingMock = mockStatic(FirebaseMessaging.class)) {

            firebaseAppMock.when(FirebaseApp::getApps).thenReturn(List.of(mock(FirebaseApp.class)));

            FirebaseMessaging messaging = mock(FirebaseMessaging.class);
            firebaseMessagingMock.when(FirebaseMessaging::getInstance).thenReturn(messaging);

            SendResponse failResponse = mock(SendResponse.class);
            when(failResponse.isSuccessful()).thenReturn(false);
            FirebaseMessagingException exception = mock(FirebaseMessagingException.class);
            when(exception.getMessagingErrorCode()).thenReturn(MessagingErrorCode.INVALID_ARGUMENT);
            when(failResponse.getException()).thenReturn(exception);

            BatchResponse batchResponse = mock(BatchResponse.class);
            when(batchResponse.getSuccessCount()).thenReturn(0);
            when(batchResponse.getFailureCount()).thenReturn(1);
            when(batchResponse.getResponses()).thenReturn(List.of(failResponse));

            when(messaging.sendEachForMulticast(any(MulticastMessage.class))).thenReturn(batchResponse);

            PushNotificationService.SendResult result =
                    pushNotificationService.sendToUsers(List.of("bad-token"), "제목", "내용");

            assertThat(result.successCount()).isEqualTo(0);
            assertThat(result.invalidTokens()).containsExactly("bad-token");
        }
    }
}
