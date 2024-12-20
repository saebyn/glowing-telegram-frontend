/**
 * Customized react-admin Edit component to use instead of the default one.
 */
import {
  PrevNextButtons,
  Edit as RAEdit,
  type EditProps as RAEditProps,
  TopToolbar,
} from 'react-admin';

const Actions = () => (
  <TopToolbar>
    <PrevNextButtons />
  </TopToolbar>
);

const GTEdit: typeof RAEdit = ({ children, ...props }) => (
  <RAEdit redirect={false} actions={<Actions />} {...props}>
    {children}
  </RAEdit>
);

export type EditProps = RAEditProps;

export default GTEdit;
