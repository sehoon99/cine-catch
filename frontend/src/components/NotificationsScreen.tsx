import { Bell, Loader2, ArrowLeft } from 'lucide-react';
import { useNotifications } from '../lib/hooks';

interface NotificationsScreenProps {
  onBack: () => void;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const { notifications, loading, markAsRead } = useNotifications();

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Notifications
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="mb-2">No Notifications</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              You'll see notifications about your subscribed theaters and favorite events here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                className={`w-full text-left bg-card rounded-2xl p-4 shadow-sm transition-colors ${
                  !notification.isRead ? 'border-l-4 border-accent' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    !notification.isRead ? 'bg-accent' : 'bg-transparent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-normal'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.body}
                    </p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
