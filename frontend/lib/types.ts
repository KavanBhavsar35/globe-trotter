// Shared API shapes. Mirror backend/main.py responses.

export type Trip = {
  id: number;
  name: string;
  country: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  description?: string | null;
  is_public: boolean;
  share_token?: string | null;
  stop_count?: number; // added by GET /trips
};

export type City = {
  id: number;
  name: string;
  country: string;
  cost_index: number;
};

export type Activity = {
  id: number;
  city_id: number;
  name: string;
  type: string;
  cost: number;
  duration_hours: number;
};

export type StopActivity = {
  stop_activity_id: number;
  activity_id: number;
  name: string;
  type: string;
  cost: number;
  duration_hours: number;
};

export type ItineraryStop = {
  stop_id: number;
  city: City;
  start_date: string;
  end_date: string;
  nights: number;
  activities: StopActivity[];
  subtotal: number;
};

export type Budget = {
  total: number;
  categories: Record<string, number>;
  per_day_avg: number;
};

export type Itinerary = {
  trip: Trip;
  stops: ItineraryStop[];
  budget: Budget;
};
