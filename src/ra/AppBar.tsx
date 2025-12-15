import Button from '@mui/material/Button';
import { AppBar, Logout, TitlePortal, UserMenu } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { WebSocketStatusIndicator } from '@/components/atoms/WebSocketStatusIndicator';
import TasksDrawer from '@/components/organisms/TasksDrawer';
import ProfileMenuItem from './ProfileMenuItem';

const MyAppBar = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      userMenu={
        <UserMenu>
          <ProfileMenuItem />
          <Logout />
        </UserMenu>
      }
    >
      <TitlePortal />
      <Button onClick={() => navigate('/stream-manager')}>
        Stream Manager
      </Button>

      <WebSocketStatusIndicator />
      <TasksDrawer />
    </AppBar>
  );
};

export default MyAppBar;
