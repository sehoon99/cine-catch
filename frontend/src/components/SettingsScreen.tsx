import { Switch } from './ui/switch';

export function SettingsScreen() {
  return (
    <div className="p-4">
      <h1 className="mb-6">Settings</h1>
      
      <div className="space-y-4">
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
            <Switch defaultChecked />
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
