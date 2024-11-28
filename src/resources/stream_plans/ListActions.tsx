import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  Button,
  CreateButton,
  FilterButton,
  ListButton,
  TopToolbar,
  useListContext,
} from 'react-admin';
import { Link } from 'react-router-dom';

interface ListActionsProps {
  view: 'list' | 'calendar';

  prevDateUrl?: string;
  nextDateUrl?: string;

  weekViewUrl?: string;
  monthViewUrl?: string;
}

const ListActions = (props: ListActionsProps) => {
  const { filterValues } = useListContext();

  return (
    <TopToolbar>
      <FilterButton />
      <CreateButton />

      {props.view === 'list' ? (
        <Button
          component={Link}
          to={{
            pathname: '/stream_plans/calendar',
            search: `?filter=${JSON.stringify(filterValues)}`,
          }}
          label="Calendar"
        >
          <CalendarMonthIcon />
        </Button>
      ) : null}

      {props.view === 'calendar' ? (
        <>
          <ListButton />

          {props.weekViewUrl ? (
            <Button to={props.weekViewUrl} label="Week">
              <CalendarMonthIcon />
            </Button>
          ) : null}
          {props.monthViewUrl ? (
            <Button to={props.monthViewUrl} label="Month">
              <CalendarMonthIcon />
            </Button>
          ) : null}

          <Button to={props.prevDateUrl} label="Previous">
            <ArrowLeftIcon />
          </Button>
          <Button to={props.nextDateUrl} label="Next">
            <ArrowRightIcon />
          </Button>
        </>
      ) : null}
    </TopToolbar>
  );
};

export default ListActions;
