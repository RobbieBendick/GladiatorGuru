import { Routes, Route } from 'react-router-dom';
import { Home } from '../home/home';
import { BookingForm } from '../booking/booking-form';
import { BookingSuccess } from '../booking/booking-success';
import { Login } from '../auth/login';
import { Signup } from '../auth/signup';
import { AdminLogin } from '../admin/admin-login';
import { AdminDashboard } from '../admin/admin-dashboard';
import { ProtectedRoute } from '../admin/protected-route';
import ResponsiveNavBar from '../nav/navbar';
import { IRoute, ROUTE_PATHS } from '../../schemas/route-paths';

const routes: IRoute[] = [
  {
    path: ROUTE_PATHS.home,
    element: <Home />,
  },
  {
    path: ROUTE_PATHS.booking,
    element: <BookingForm />,
  },
];

export function BindRoutes(props: { children?: React.ReactNode }): JSX.Element {
  return (
    <>
      <ResponsiveNavBar />
      <Routes>
        {routes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path={ROUTE_PATHS.bookingSuccess} element={<BookingSuccess />} />
        <Route path={ROUTE_PATHS.login} element={<Login />} />
        <Route path={ROUTE_PATHS.signup} element={<Signup />} />
        <Route path={ROUTE_PATHS.adminLogin} element={<AdminLogin />} />
        <Route
          path={ROUTE_PATHS.admin}
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {props.children}
      </Routes>
    </>
  );
}
