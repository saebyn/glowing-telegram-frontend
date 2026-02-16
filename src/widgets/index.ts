/**
 * Widget Registry Initialization
 *
 * This file provides a function to register all available widget types.
 * Call registerWidgets() early in the application lifecycle to ensure
 * all widgets are registered before they are needed.
 */

import { adTimerDefinition } from './ad-timer';
import { countdownTimerDefinition } from './countdown-timer';
import { widgetRegistry } from './registry';

/**
 * Register all available widget types.
 * This function should be called during application startup.
 */
export function registerWidgets(): void {
  widgetRegistry.register(countdownTimerDefinition);
  widgetRegistry.register(adTimerDefinition);
}

// Export the registry for use throughout the application
export { widgetRegistry };
export type { WidgetAction, WidgetDefinition, WidgetProps } from './registry';
