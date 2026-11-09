export interface Wish {
  id: string;
  name: string;
  attendance: 'yes' | 'no' | 'maybe';
  message: string;
  images: string[];
  isPublic: boolean;
  likes: number;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  badge: string;
  images: {
    url: string;
    caption: string;
  }[];
}

export interface ParkingLocation {
  id: string;
  name: string;
  description: string;
  mapUrl?: string;
  address?: string;
  vehicleType?: string;
  fee?: string;
  tips?: string;
}

export interface TimelineMilestone {
  time: string;
  title: string;
  description: string;
  location?: string;
  iconName?: string;
  badge?: string;
  highlight?: boolean;
}

export interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  relation?: string;
}

export interface SidePhotoItem {
  id: string;
  src: string;
  rotate: number;
  position: 'left' | 'right';
  top: string;
}

export interface GuestItem {
  id: string;
  name: string;
  secretLetter?: string;
  customLetterImage?: string;
  phone?: string;
  note?: string;
  createdAt: string;
}

export interface CheckinPhoto {
  id: string;
  imageUrl: string;
  guestName?: string;
  createdAt: string;
}

export interface SiteConfig {
  defaultLetterImage: string;
  venueName: string;
  venueAddress: string;
  googleMapUrl: string;
  graduationDate: string;
  countdownTarget?: string;
  contacts: ContactPerson[];
  parkingLocations: ParkingLocation[];
  timeline: TimelineMilestone[];
  collections: CollectionItem[];
  sidePhotosLeft: SidePhotoItem[];
  sidePhotosRight: SidePhotoItem[];
  guests: GuestItem[];
}
