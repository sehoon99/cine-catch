import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { apiClient, API_ENDPOINTS } from './api';

// FCM 토큰 저장 API 엔드포인트 추가
const FCM_TOKEN_ENDPOINT = '/api/members/fcm-token';

export const pushNotificationService = {
  /**
   * 푸시 알림 초기화 및 권한 요청
   */
  async initialize(): Promise<string | null> {
    // 네이티브 플랫폼에서만 동작
    if (!Capacitor.isNativePlatform()) {
      console.log('[Push] 웹 환경에서는 푸시 알림을 지원하지 않습니다.');
      return null;
    }

    try {
      // 권한 확인
      let permStatus = await PushNotifications.checkPermissions();
      console.log('[Push] 현재 권한 상태:', permStatus.receive);

      // 권한이 없으면 요청
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('[Push] 푸시 알림 권한이 거부되었습니다.');
        return null;
      }

      // 푸시 알림 등록
      await PushNotifications.register();
      console.log('[Push] 푸시 알림 등록 완료');

      // 토큰 받기를 Promise로 래핑
      return new Promise((resolve) => {
        PushNotifications.addListener('registration', (token) => {
          console.log('[Push] FCM 토큰 발급:', token.value);
          resolve(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('[Push] 토큰 발급 실패:', error);
          resolve(null);
        });
      });
    } catch (error) {
      console.error('[Push] 초기화 실패:', error);
      return null;
    }
  },

  /**
   * FCM 토큰을 백엔드에 저장
   */
  async saveTokenToServer(token: string): Promise<boolean> {
    try {
      await apiClient.post(FCM_TOKEN_ENDPOINT, { fcmToken: token });
      console.log('[Push] FCM 토큰 서버 저장 완료');
      return true;
    } catch (error) {
      console.error('[Push] FCM 토큰 서버 저장 실패:', error);
      return false;
    }
  },

  /**
   * 푸시 알림 리스너 설정
   */
  setupListeners(onNotificationReceived?: (notification: any) => void): void {
    if (!Capacitor.isNativePlatform()) return;

    // 앱이 포그라운드에 있을 때 알림 수신
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] 알림 수신 (포그라운드):', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // 사용자가 알림을 탭했을 때
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Push] 알림 탭:', action);
      // 여기서 특정 화면으로 이동하는 로직 추가 가능
    });
  },

  /**
   * 모든 리스너 제거
   */
  removeListeners(): void {
    PushNotifications.removeAllListeners();
  }
};
