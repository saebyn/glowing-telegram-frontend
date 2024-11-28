import { Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useLogin, useNotify, useTranslate } from 'react-admin';

const cardStyle = {
  maxWidth: '50em',
  margin: '6em auto',
  padding: 20,
  textAlign: 'center',
};

const MyLoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();

  const callback = () => {
    login({}).catch(() => notify('ra.auth.sign_in_error'));
  };

  // check if the user is already authenticated
  useEffect(() => {
    const timeout = setTimeout(callback, 1000);

    return () => clearTimeout(timeout);
  });

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Card sx={cardStyle}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {translate('gt.login.redirecting', { _: 'Redirecting...' })}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyLoginPage;
