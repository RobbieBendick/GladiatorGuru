export interface IRoute {
  path: string;
  element: JSX.Element;
}
export const ROUTE_PATHS: { [key: string]: string } = {
  home: '/',
  booking: '/booking',
  bookingSuccess: '/booking/success',
  pastBookings: '/past-bookings',
  howItWorks: '/how-it-works',
  calendar: '/calendar',
  login: '/login',
  signup: '/signup',
  admin: '/admin',
  adminLogin: '/admin/login',
  coach: '/coach',
  coachSchedule: '/:id/schedule',
  jobDetails: '/job/:id',
  discordCallback: '/auth/discord/callback',
  settings: '/settings',
};
