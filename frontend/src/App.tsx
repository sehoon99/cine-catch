import { useState } from 'react';
import { Home, Map, Bell, Settings, MapPin } from 'lucide-react';
import { HomeScreen } from './components/HomeScreen';
import { TheatersScreen } from './components/TheatersScreen';
import { EventDetailScreen } from './components/EventDetailScreen';
import { SubscriptionsScreen } from './components/SubscriptionsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

type Screen = 'home' | 'theaters' | 'subscriptions' | 'settings' | 'event-detail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  const navigateToEventDetail = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentScreen('event-detail');
  };

  const navigateBack = () => {
    setCurrentScreen('home');
    setSelectedEventId(null);
  };

  const updateLocation = () => {
    setIsUpdatingLocation(true);
    
    // Simulate location update
    setTimeout(() => {
      setIsUpdatingLocation(false);
      toast.success('Location updated', {
        description: 'Showing events near you',
      });
    }, 1000);
  };

  return (
    <div className="dark min-h-screen">
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background text-foreground relative">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20">
          {currentScreen === 'home' && <HomeScreen onEventClick={navigateToEventDetail} />}
          {currentScreen === 'theaters' && <TheatersScreen />}
          {currentScreen === 'subscriptions' && <SubscriptionsScreen />}
          {currentScreen === 'settings' && <SettingsScreen />}
          {currentScreen === 'event-detail' && selectedEventId && (
            <EventDetailScreen eventId={selectedEventId} onBack={navigateBack} />
          )}
        </main>

        {/* Floating Action Button for Location */}
        {currentScreen !== 'event-detail' && (
          <button
            onClick={updateLocation}
            disabled={isUpdatingLocation}
            className={`fixed bottom-24 right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-accent/80 transition-all z-10 ${
              isUpdatingLocation ? 'scale-90 opacity-50' : 'hover:scale-105'
            }`}
            aria-label="Update location"
          >
            <MapPin className={`w-6 h-6 ${isUpdatingLocation ? 'animate-pulse' : ''}`} />
          </button>
        )}

        {/* Bottom Navigation Bar */}
        {currentScreen !== 'event-detail' && (
          <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-w-md mx-auto">
            <div className="flex justify-around items-center h-16 px-2">
              <NavButton
                icon={<Home className="w-6 h-6" />}
                label="Home"
                active={currentScreen === 'home'}
                onClick={() => setCurrentScreen('home')}
              />
              <NavButton
                icon={<Map className="w-6 h-6" />}
                label="Theaters"
                active={currentScreen === 'theaters'}
                onClick={() => setCurrentScreen('theaters')}
              />
              <NavButton
                icon={<Bell className="w-6 h-6" />}
                label="Subscriptions"
                active={currentScreen === 'subscriptions'}
                onClick={() => setCurrentScreen('subscriptions')}
              />
              <NavButton
                icon={<Settings className="w-6 h-6" />}
                label="Settings"
                active={currentScreen === 'settings'}
                onClick={() => setCurrentScreen('settings')}
              />
            </div>
          </nav>
        )}
      </div>
      <Toaster />
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
        active ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}