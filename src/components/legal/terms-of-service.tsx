import { Box, Container, Typography, Paper, Divider } from '@mui/material';

export function TermsOfService() {
  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ '& > *': { mb: 3 } }}>
          <section>
            <Typography variant='h6' gutterBottom>
              1. Acceptance of Terms
            </Typography>
            <Typography variant='body1' paragraph>
              By accessing and using GladiatorGuru, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to these terms, please do not use our service.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              2. Description of Service
            </Typography>
            <Typography variant='body1' paragraph>
              GladiatorGuru is a platform that connects customers with coaches
              for booking and managing coaching sessions. We provide tools for
              scheduling, communication, and session management.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              3. User Accounts
            </Typography>
            <Typography variant='body1' paragraph>
              To use certain features of our service, you must create an
              account. You agree to:
            </Typography>
            <Typography component='ul' variant='body1' sx={{ pl: 3 }}>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              4. Booking and Cancellation Policy
            </Typography>
            <Typography variant='body1' paragraph>
              When booking a coaching session:
            </Typography>
            <Typography component='ul' variant='body1' sx={{ pl: 3 }}>
              <li>Bookings are subject to coach availability</li>
              <li>Cancellation policies may vary by coach</li>
              <li>
                Refunds are subject to our refund policy and coach discretion
              </li>
              <li>
                You are responsible for attending scheduled sessions on time
              </li>
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              5. User Conduct
            </Typography>
            <Typography variant='body1' paragraph>
              You agree not to:
            </Typography>
            <Typography component='ul' variant='body1' sx={{ pl: 3 }}>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Transmit any viruses, malware, or harmful code</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              6. Intellectual Property
            </Typography>
            <Typography variant='body1' paragraph>
              The service and its original content, features, and functionality
              are owned by GladiatorGuru and are protected by international
              copyright, trademark, patent, trade secret, and other intellectual
              property laws.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              7. Limitation of Liability
            </Typography>
            <Typography variant='body1' paragraph>
              GladiatorGuru shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use of or inability to use the service.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              8. Indemnification
            </Typography>
            <Typography variant='body1' paragraph>
              You agree to defend, indemnify, and hold harmless GladiatorGuru
              and its officers, directors, employees, and agents from any
              claims, damages, obligations, losses, liabilities, costs, or debt.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              9. Termination
            </Typography>
            <Typography variant='body1' paragraph>
              We may terminate or suspend your account and access to the service
              immediately, without prior notice, for conduct that we believe
              violates these Terms of Service or is harmful to other users, us,
              or third parties.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              10. Changes to Terms
            </Typography>
            <Typography variant='body1' paragraph>
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes by posting the new Terms of
              Service on this page and updating the "Last updated" date.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              11. Governing Law
            </Typography>
            <Typography variant='body1' paragraph>
              These Terms shall be governed by and construed in accordance with
              applicable laws, without regard to its conflict of law provisions.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              12. Contact Information
            </Typography>
            <Typography variant='body1' paragraph>
              If you have any questions about these Terms of Service, please
              contact us through your account settings or via the contact
              information provided on our platform.
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
}
