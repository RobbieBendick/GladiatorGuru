import { Routes, Route } from 'react-router-dom';
import { Home } from '../home/home';
import { BookingForm } from '../booking/booking-form';
import { BookingSuccess } from '../booking/booking-success';
import { PastBookings } from '../booking/past-bookings';
import { HowItWorks } from '../how-it-works/how-it-works';
import { Calendar } from '../calendar/calendar';
import { Login } from '../auth/login';
import { Signup } from '../auth/signup';
import { DiscordCallback } from '../auth/discord-callback';
import { AdminDashboard } from '../admin/admin-dashboard';
import { CoachList } from '../admin/coach-list';
import { CustomerManagement } from '../admin/customer-management';
import { CustomerDetail } from '../admin/customer-detail';
import { ProtectedRoute } from '../admin/protected-route';
import { CoachSchedule } from '../schedule/coach-schedule';
import { JobDetails } from '../job/job-details';
import { CoachDashboard } from '../coach/coach-dashboard';
import { Settings } from '../settings/settings';
import { PrivacyPolicy } from '../legal/privacy-policy';
import { TermsOfService } from '../legal/terms-of-service';
import { CoachTracker } from '../coach-tracker/coach-tracker';
import { Dashboard1 } from '../coach-tracker/dashboard1';
import { Dashboard2 } from '../coach-tracker/dashboard2';
import { Dashboard3 } from '../coach-tracker/dashboard3';
import { Dashboard4 } from '../coach-tracker/dashboard4';
import { Dashboard5 } from '../coach-tracker/dashboard5';
import ResponsiveNavBar from '../nav/navbar';
import { Footer } from '../footer/footer';
import { IRoute, ROUTE_PATHS } from '../../schemas/route-paths';
import { Box } from '@mui/material';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <ResponsiveNavBar />
      <Box sx={{ flex: 1 }}>
        <Routes>
          {routes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route
            path={ROUTE_PATHS.bookingSuccess}
            element={<BookingSuccess />}
          />
          <Route path={ROUTE_PATHS.pastBookings} element={<PastBookings />} />
          <Route path={ROUTE_PATHS.howItWorks} element={<HowItWorks />} />
          <Route path={ROUTE_PATHS.calendar} element={<Calendar />} />
          <Route path={ROUTE_PATHS.login} element={<Login />} />
          <Route path={ROUTE_PATHS.signup} element={<Signup />} />
          <Route
            path={ROUTE_PATHS.discordCallback}
            element={<DiscordCallback />}
          />
          <Route
            path={ROUTE_PATHS.admin}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
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
          <Route
            path={ROUTE_PATHS.customerManagement}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CustomerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.customerDetail}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CustomerDetail />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTE_PATHS.coachSchedule} element={<CoachSchedule />} />
          <Route path={ROUTE_PATHS.jobDetails} element={<JobDetails />} />
          <Route
            path={ROUTE_PATHS.coach}
            element={
              <ProtectedRoute allowedRoles={['coach', 'admin']}>
                <CoachDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_PATHS.settings}
            element={
              <ProtectedRoute requireAuthOnly={true}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/coach-tracker'
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CoachTracker />
              </ProtectedRoute>
            }
          />
          <Route path='/admin/dashboard1' element={<ProtectedRoute allowedRoles={['admin']}><Dashboard1 /></ProtectedRoute>} />
          <Route path='/admin/dashboard2' element={<ProtectedRoute allowedRoles={['admin']}><Dashboard2 /></ProtectedRoute>} />
          <Route path='/admin/dashboard3' element={<ProtectedRoute allowedRoles={['admin']}><Dashboard3 /></ProtectedRoute>} />
          <Route path='/admin/dashboard4' element={<ProtectedRoute allowedRoles={['admin']}><Dashboard4 /></ProtectedRoute>} />
          <Route path='/admin/dashboard5' element={<ProtectedRoute allowedRoles={['admin']}><Dashboard5 /></ProtectedRoute>} />
          <Route path={ROUTE_PATHS.privacyPolicy} element={<PrivacyPolicy />} />
          <Route
            path={ROUTE_PATHS.termsOfService}
            element={<TermsOfService />}
          />
          {props.children}
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}
