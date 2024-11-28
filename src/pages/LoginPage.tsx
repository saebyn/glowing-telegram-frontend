import { Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useCheckAuth, useLogin, useNotify, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router-dom';

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
  const checkAuth = useCheckAuth();
  const navigate = useNavigate();

  // check if the user is already authenticated
  useEffect(() => {
    checkAuth({}, false)
      // if the user is authenticated, redirect to the home page
      .then(() => navigate('/'))
      // if the user is not authenticated, do nothing
      .catch(() => {
        login({}).catch(() => notify('ra.auth.sign_in_error'));
      });
  }, [checkAuth, navigate, login, notify]);

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
