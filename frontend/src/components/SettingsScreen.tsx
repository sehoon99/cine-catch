import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

type SettingsScreenProps = {
  authEmail?: string;
  onLogout?: () => void;
};

export function SettingsScreen({ authEmail, onLogout }: SettingsScreenProps) {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const status = await Geolocation.checkPermissions();
      setLocationEnabled(status.location === 'granted');
    } catch (error) {
      console.error('Failed to check location permission:', error);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const handleLocationToggle = async (checked: boolean) => {
    if (checked) {
      try {
        const status = await Geolocation.requestPermissions();
        if (status.location === 'granted') {
          setLocationEnabled(true);
          toast.success('위치 서비스가 활성화되었습니다');
        } else {
          setLocationEnabled(false);
          toast.error('위치 권한이 거부되었습니다', {
            description: '설정에서 위치 권한을 허용해주세요'
          });
        }
      } catch (error) {
        console.error('Failed to request location permission:', error);
        toast.error('위치 권한 요청 실패');
      }
    } else {
      setLocationEnabled(false);
      toast.info('위치 서비스가 비활성화되었습니다', {
        description: '완전히 해제하려면 시스템 설정에서 변경하세요'
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Settings</h1>
      
      <div className="space-y-4">
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3>Account</h3>
          <p className="text-sm text-muted-foreground">
            {authEmail ? authEmail : 'Signed in'}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={onLogout}
          >
            Log out
          </Button>
        </div>

        <div className="bg-card rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3>Push Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive alerts for new events</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3>Location Services</h3>
              <p className="text-sm text-muted-foreground">Enable location-based discovery</p>
            </div>
            <Switch
              checked={locationEnabled}
              onCheckedChange={handleLocationToggle}
              disabled={isCheckingPermission}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3>Dark Mode</h3>
              <p className="text-sm text-muted-foreground">Always use dark theme</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3>About</h3>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-sm text-muted-foreground">
            Cine-Catch helps you discover movie theater events near you.
          </p>
        </div>
      </div>
    </div>
  );
}
