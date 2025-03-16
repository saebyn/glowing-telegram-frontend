import { deepmerge } from '@mui/utils';
import {
  radiantDarkTheme as baseDarkTheme,
  radiantLightTheme as baseLightTheme,
} from 'react-admin';

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

export const lightTheme = deepmerge(baseLightTheme, themeOverrides);
export const darkTheme = deepmerge(baseDarkTheme, themeOverrides);
