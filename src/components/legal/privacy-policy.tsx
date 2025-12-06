import { Box, Container, Typography, Paper, Divider } from '@mui/material';

export function PrivacyPolicy() {
  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ '& > *': { mb: 3 } }}>
          <section>
            <Typography variant='h6' gutterBottom>
              1. Information We Collect
            </Typography>
            <Typography variant='body1' paragraph>
              We collect information that you provide directly to us, including:
            </Typography>
            <Typography component='ul' variant='body1' sx={{ pl: 3 }}>
              <li>
                Personal information such as name, email address, and phone
                number
              </li>
              <li>Account credentials and authentication information</li>
              <li>Booking and scheduling information</li>
              <li>Discord account information (if connected)</li>
              <li>Timezone preferences</li>
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              2. How We Use Your Information
            </Typography>
            <Typography variant='body1' paragraph>
              We use the information we collect to:
            </Typography>
            <Typography component='ul' variant='body1' sx={{ pl: 3 }}>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and manage your bookings and coaching sessions</li>
              <li>
                Send you notifications via Discord or other communication
                channels
              </li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Comply with legal obligations</li>
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              3. Information Sharing
            </Typography>
            <Typography variant='body1' paragraph>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only in the following
              circumstances:
            </Typography>
            <Typography component='ul' variant='body1' sx={{ pl: 3 }}>
              <li>
                With your assigned coaches to facilitate coaching sessions
              </li>
              <li>When required by law or to protect our rights</li>
              <li>
                With service providers who assist us in operating our platform
              </li>
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              4. Data Security
            </Typography>
            <Typography variant='body1' paragraph>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              5. Your Rights
            </Typography>
            <Typography variant='body1' paragraph>
              You have the right to:
            </Typography>
            <Typography component='ul' variant='body1' sx={{ pl: 3 }}>
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of certain communications</li>
              <li>Disconnect your Discord account at any time</li>
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              6. Cookies and Tracking
            </Typography>
            <Typography variant='body1' paragraph>
              We use cookies and similar tracking technologies to enhance your
              experience, analyze usage patterns, and improve our services.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              7. Changes to This Policy
            </Typography>
            <Typography variant='body1' paragraph>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the "Last updated" date.
            </Typography>
          </section>

          <section>
            <Typography variant='h6' gutterBottom>
              8. Contact Us
            </Typography>
            <Typography variant='body1' paragraph>
              If you have any questions about this Privacy Policy, please
              contact us through your account settings or via the contact
              information provided on our platform.
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
}
