export interface MovieEvent {
  id: string;
  title: string;
  posterUrl: string;
  type: 'Goods' | 'Coupon' | 'GV';
  distance: number;
  available: boolean;
  theaters: TheaterAvailability[];
  description: string;
  date: string;
  time: string;
}

export interface TheaterAvailability {
  theaterId: string;
  theaterName: string;
  brand: string;
  address: string;
  distance: number;
  available: boolean;
  lat: number;
  lng: number;
}

export interface Theater {
  id: string;
  name: string;
  brand: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
  subscribed?: boolean;
}

export const mockEvents: MovieEvent[] = [
  {
    id: '1',
    title: 'The Quantum Paradox',
    posterUrl: 'https://images.unsplash.com/photo-1765510296004-614b6cc204da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NjgyMzk0MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'GV',
    distance: 1.2,
    available: true,
    description: 'Join us for an exclusive screening of The Quantum Paradox with a special Q&A session with the director.',
    date: 'Jan 18, 2026',
    time: '7:00 PM',
    theaters: [
      {
        theaterId: 't1',
        theaterName: 'Cineplex Downtown',
        brand: 'Cineplex',
        address: '123 Main St, Downtown',
        distance: 1.2,
        available: true,
        lat: 40.7589,
        lng: -73.9851,
      },
      {
        theaterId: 't2',
        theaterName: 'AMC Theater City',
        brand: 'AMC',
        address: '456 Broadway Ave',
        distance: 2.5,
        available: false,
        lat: 40.7614,
        lng: -73.9776,
      },
      {
        theaterId: 't3',
        theaterName: 'Regal Cinema Plaza',
        brand: 'Regal',
        address: '789 Park Blvd',
        distance: 3.1,
        available: true,
        lat: 40.7489,
        lng: -73.9680,
      },
    ],
  },
  {
    id: '2',
    title: 'Midnight Shadows',
    posterUrl: 'https://images.unsplash.com/photo-1630338679229-99fb150fbf88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3Jyb3IlMjBtb3ZpZSUyMGRhcmt8ZW58MXx8fHwxNzY4MjI2MTg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'Coupon',
    distance: 0.8,
    available: true,
    description: 'Get 50% off tickets for the horror thriller Midnight Shadows. Limited seats available.',
    date: 'Jan 20, 2026',
    time: '9:30 PM',
    theaters: [
      {
        theaterId: 't1',
        theaterName: 'Cineplex Downtown',
        brand: 'Cineplex',
        address: '123 Main St, Downtown',
        distance: 0.8,
        available: true,
        lat: 40.7589,
        lng: -73.9851,
      },
      {
        theaterId: 't4',
        theaterName: 'Showcase Cinema',
        brand: 'Showcase',
        address: '321 Fifth Ave',
        distance: 1.9,
        available: true,
        lat: 40.7505,
        lng: -73.9934,
      },
    ],
  },
  {
    id: '3',
    title: 'Summer Blockbuster',
    posterUrl: 'https://images.unsplash.com/photo-1612544409025-e1f6a56c1152?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwcHJvZHVjdGlvbnxlbnwxfHx8fDE3NjgxNjE0NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'Goods',
    distance: 2.3,
    available: false,
    description: 'Purchase exclusive Summer Blockbuster merchandise bundles. Includes poster, t-shirt, and collectible cup.',
    date: 'Jan 15, 2026',
    time: 'All Day',
    theaters: [
      {
        theaterId: 't2',
        theaterName: 'AMC Theater City',
        brand: 'AMC',
        address: '456 Broadway Ave',
        distance: 2.3,
        available: false,
        lat: 40.7614,
        lng: -73.9776,
      },
    ],
  },
  {
    id: '4',
    title: 'Classic Cinema Night',
    posterUrl: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBzY3JlZW58ZW58MXx8fHwxNzY4Mjg1MDA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'GV',
    distance: 1.5,
    available: true,
    description: 'Experience classic films on the big screen every Thursday night.',
    date: 'Jan 16, 2026',
    time: '8:00 PM',
    theaters: [
      {
        theaterId: 't3',
        theaterName: 'Regal Cinema Plaza',
        brand: 'Regal',
        address: '789 Park Blvd',
        distance: 1.5,
        available: true,
        lat: 40.7489,
        lng: -73.9680,
      },
      {
        theaterId: 't4',
        theaterName: 'Showcase Cinema',
        brand: 'Showcase',
        address: '321 Fifth Ave',
        distance: 2.8,
        available: true,
        lat: 40.7505,
        lng: -73.9934,
      },
    ],
  },
];

export const mockTheaters: Theater[] = [
  {
    id: 't1',
    name: 'Cineplex Downtown',
    brand: 'Cineplex',
    address: '123 Main St, Downtown',
    distance: 1.2,
    lat: 40.7589,
    lng: -73.9851,
    subscribed: true,
  },
  {
    id: 't2',
    name: 'AMC Theater City',
    brand: 'AMC',
    address: '456 Broadway Ave',
    distance: 2.5,
    lat: 40.7614,
    lng: -73.9776,
    subscribed: false,
  },
  {
    id: 't3',
    name: 'Regal Cinema Plaza',
    brand: 'Regal',
    address: '789 Park Blvd',
    distance: 3.1,
    lat: 40.7489,
    lng: -73.9680,
    subscribed: true,
  },
  {
    id: 't4',
    name: 'Showcase Cinema',
    brand: 'Showcase',
    address: '321 Fifth Ave',
    distance: 4.2,
    lat: 40.7505,
    lng: -73.9934,
    subscribed: false,
  },
  {
    id: 't5',
    name: 'Alamo Drafthouse',
    brand: 'Alamo',
    address: '555 West End',
    distance: 5.0,
    lat: 40.7456,
    lng: -73.9912,
    subscribed: true,
  },
];
