import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useGetIdentity, useNotify, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import gravatar from '../gravitar';

const ProfilePage = () => {
  const [profile, setProfile] = useState<{ email: string; fullName: string }>({
    email: '',
    fullName: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const notify = useNotify();
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (!identity) {
      navigate('/login');
      return;
    }

    setProfile({ email: identity.email, fullName: identity.fullName || '' });
    setAvatarUrl(gravatar(identity.email, identity.fullName));
  }, [identity, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    if (name === 'email' || name === 'fullName') {
      setAvatarUrl(gravatar(profile.email, profile.fullName));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO update the user profile
      notify('Profile updated successfully', { type: 'success' });
    } catch (error) {
      notify('Error updating profile', { type: 'warning' });
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Card>
        <CardContent>
          <Avatar src={avatarUrl} />
          <form onSubmit={handleSubmit}>
            <TextField
              label={translate('gt.email', { _: 'Email' })}
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label={translate('gt.name', { _: 'Name' })}
              name="fullName"
              type="text"
              value={profile.fullName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {translate('ra.action.save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
