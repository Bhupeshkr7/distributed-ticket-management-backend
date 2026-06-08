export const CacheKeys = {
  showDetail: (showId: string) => `show:${showId}:detail`,
  showsList: (query: string) => `shows:list:${query}`,
  showSeats: (showId: string) => `show:${showId}:seats`,
  venueDetail: (venueId: string) => `venue:${venueId}:detail`,
  venuesList: (query: string) => `venues:list:${query}`,
  bookingDetail: (bookingId: string) => `booking:${bookingId}:detail`,
  bookingsList: (userId: string) => `bookings:list:${userId}`,
  userDetail: (userId: string) => `user:${userId}:detail`,
  seatLock: (seatId: string) => `seat:lock:${seatId}`,
  idempotency: (hash: string) => `idem:${hash}`,
  rateLimit: (userId: string, min: number) => `ratelimit:${userId}:${min}`,
  refreshToken: (userId: string) => `refresh:${userId}`,
} as const;


export const CacheTTL = {
  SHOW_DETAIL: 300,
  SHOW_LIST: 600,
  SHOW_SEATS: 60,
  VENUE_DETAIL: 3600,
  VENUE_LIST: 1800,
  BOOKING_DETAIL: 300,
  BOOKING_LIST: 300,
  USER_DETAIL: 3600,
  SEAT_LOCK: 300,
  IDEMPOTENCY: 86400,
  RATE_LIMIT: 60,
  REFRESH: 604800,
} as const;
