import { Routes, Route } from 'react-router-dom';
import { Home } from '@/components/home/home';
import { BookingForm } from '@/components/booking/booking-form';
import ResponsiveNavBar from '@/components/nav/navbar';
import { IRoute, ROUTE_PATHS } from '@/schemas/route-paths';

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
        {props.children}
      </Routes>
    </>
  );
}
