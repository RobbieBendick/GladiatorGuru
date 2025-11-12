export interface IRoute {
  path: string;
  element: JSX.Element;
}
export const ROUTE_PATHS: { [key: string]: string } = {
  home: '/',
  booking: '/booking',
  bookingSuccess: '/booking/success',
  login: '/login',
  signup: '/signup',
  admin: '/admin',
  adminLogin: '/admin/login',
};
