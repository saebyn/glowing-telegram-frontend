/**
 * Widget Registry
 *
 * This module provides a registry system for widget types, making it easy to:
 * - Register new widget types
 * - Get widget definitions by type
 * - List all available widget types
 * - Define widget-specific configuration schemas and actions
 */

import type { ComponentType } from 'react';

export interface WidgetProps {
  widgetId: string;
}

export interface WidgetAction {
  name: string;
  label: string;
  icon?: string;
  payloadSchema?: unknown; // JSONSchema - use unknown for now until we add JSON Schema types
}

export interface WidgetDefinition {
  type: string;
  name: string;
  description: string;
  component: ComponentType<WidgetProps>;
  configSchema?: unknown; // JSONSchema - use unknown for now until we add JSON Schema types
  defaultConfig: Record<string, unknown>;
  defaultState: Record<string, unknown>;
  actions: WidgetAction[];
}

class WidgetRegistry {
  private widgets = new Map<string, WidgetDefinition>();

  /**
   * Register a new widget type
   */
  register(definition: WidgetDefinition): void {
    if (this.widgets.has(definition.type)) {
      console.warn(
        `Widget type "${definition.type}" is already registered. Overwriting.`,
      );
    }
    this.widgets.set(definition.type, definition);
  }

  /**
   * Get a widget definition by type
   */
  get(type: string): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  /**
   * Check if a widget type is registered
   */
  has(type: string): boolean {
    return this.widgets.has(type);
  }

  /**
   * Get all registered widget types
   */
  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Get widget type choices for React Admin SelectInput
   */
  getChoices(): Array<{ id: string; name: string }> {
    return this.getAll().map((widget) => ({
      id: widget.type,
      name: widget.name,
    }));
  }
}

// Export singleton instance
export const widgetRegistry = new WidgetRegistry();
