export type ListingType = "service" | "produit";

export type Media = {
  id: string;
  listing_id: string;
  url: string;
  kind: "image" | "video";
  position: number;
  created_at: string;
};

export type Listing = {
  id: string;
  user_id: string;
  type: ListingType;
  category: string;
  title: string;
  description: string;
  price: string;
  country: string;
  commune: string;
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean;
  featured_until: string | null;
  created_at: string;
  distance_km?: number;
  listing_media?: Media[];
};

export type Message = {
  id: string;
  listing_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  profiles?: { display_name: string } | null;
};

export type Profile = {
  id: string;
  display_name: string;
  created_at: string;
};
