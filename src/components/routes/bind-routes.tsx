import { Routes, Route } from 'react-router-dom';
import { Home } from '../home/home';
import { BookingForm } from '../booking/booking-form';
import { BookingSuccess } from '../booking/booking-success';
import { HowItWorks } from '../how-it-works/how-it-works';
import { Calendar } from '../calendar/calendar';
import { Login } from '../auth/login';
import { Signup } from '../auth/signup';
import { AdminLogin } from '../admin/admin-login';
import { AdminDashboard } from '../admin/admin-dashboard';
import { CoachList } from '../admin/coach-list';
import { ProtectedRoute } from '../admin/protected-route';
import { CoachSchedule } from '../schedule/coach-schedule';
import { JobDetails } from '../job/job-details';
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
        <Route path={ROUTE_PATHS.howItWorks} element={<HowItWorks />} />
        <Route path={ROUTE_PATHS.calendar} element={<Calendar />} />
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
        <Route
          path='/admin/coaches'
          element={
            <ProtectedRoute>
              <CoachList />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTE_PATHS.coachSchedule} element={<CoachSchedule />} />
        <Route
          path={ROUTE_PATHS.jobDetails}
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />
        {props.children}
      </Routes>
    </>
  );
}
