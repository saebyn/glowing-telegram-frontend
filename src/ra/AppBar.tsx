import TasksDrawer from '@/organisms/TasksDrawer';
import Button from '@mui/material/Button';
import { AppBar, Logout, TitlePortal, UserMenu } from 'react-admin';
import ProfileMenuItem from './ProfileMenuItem';

const MyAppBar = () => (
  <AppBar
    userMenu={
      <UserMenu>
        <ProfileMenuItem />
        <Logout />
      </UserMenu>
    }
  >
    <TitlePortal />
    <Button component="a" href="/stream-manager">
      Stream Manager
    </Button>

    <TasksDrawer />
  </AppBar>
);

export default MyAppBar;
