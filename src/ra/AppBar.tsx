import { AppBar, Logout, UserMenu } from 'react-admin';
import ProfileMenuItem from './ProfileMenuItem';

const MyAppBar = () => (
  <AppBar
    userMenu={
      <UserMenu>
        <ProfileMenuItem />
        <Logout />
      </UserMenu>
    }
  />
);

export default MyAppBar;
