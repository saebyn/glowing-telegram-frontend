import SettingsIcon from '@mui/icons-material/Settings';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import * as React from 'react';
import { useTranslate, useUserMenu } from 'react-admin';
import { Link } from 'react-router-dom';

// It's important to pass the ref to allow Material UI to manage the keyboard navigation
const ProfileMenuItem = React.forwardRef<HTMLAnchorElement>((props, ref) => {
  const userMenuContext = useUserMenu();
  const translate = useTranslate();

  if (!userMenuContext) {
    throw new Error('<ProfileMenuItem> should be used inside a <UserMenu>');
  }
  const { onClose } = userMenuContext;
  return (
    <MenuItem
      onClick={onClose}
      ref={ref}
      component={Link}
      to="/profile"
      // It's important to pass the props to allow Material UI to manage the keyboard navigation
      {...props}
    >
      <ListItemIcon>
        <SettingsIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>{translate('gt.profile', { _: 'Profile' })}</ListItemText>
    </MenuItem>
  );
});

export default ProfileMenuItem;
