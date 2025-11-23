export interface IRoute {
  path: string;
  element: JSX.Element;
}
export const ROUTE_PATHS: { [key: string]: string } = {
  home: '/',
  booking: '/booking',
  bookingSuccess: '/booking/success',
  howItWorks: '/how-it-works',
  calendar: '/calendar',
  login: '/login',
  signup: '/signup',
  admin: '/admin',
  adminLogin: '/admin/login',
  coachSchedule: '/:id/schedule',
  jobDetails: '/job/:id',
  discordCallback: '/auth/discord/callback',
};
