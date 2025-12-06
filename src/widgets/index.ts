/**
 * Widget Registry Initialization
 *
 * This file registers all available widget types with the widget registry.
 * Import this file early in the application lifecycle to ensure all widgets
 * are registered before they are needed.
 */

import { countdownTimerDefinition } from './countdown-timer';
import { widgetRegistry } from './registry';

// Register all widget types
widgetRegistry.register(countdownTimerDefinition);

// Export the registry for use throughout the application
export { widgetRegistry };
export type { WidgetDefinition, WidgetAction, WidgetProps } from './registry';
