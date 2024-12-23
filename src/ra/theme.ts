import { deepmerge } from '@mui/utils';
import { nanoDarkTheme, nanoLightTheme } from 'react-admin';

const themeOverrides = {
  // Disable injecting global styles for MuiInputBase
  components: {
    MuiInputBase: {
      defaultProps: {
        disableInjectingGlobalStyles: true,
      },
    },
  },
};

export const lightTheme = deepmerge(nanoLightTheme, themeOverrides);
export const darkTheme = deepmerge(nanoDarkTheme, themeOverrides);
