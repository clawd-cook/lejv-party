// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import type { BaseEvent, StandardProps } from '@lynx-js/types';

declare module '@lynx-js/types' {
  interface GlobalProps {
    preferredTheme?: string;
    theme: string;
    isNotchScreen: boolean;
    /** Scheme query params for room page (assumed Sparkling merge). */
    roomId?: string
    playerId?: string
    p?: string
    /** Override NestJS API base URL (e.g. device → host machine IP). */
    apiBaseUrl?: string
    api_base_url?: string
    /** Official Sparkling bag for custom scheme query keys. */
    queryItems?: Record<string, string>
    query?: Record<string, string>
    schemeParams?: Record<string, unknown>
    extra?: Record<string, unknown>
    initial_data?: Record<string, unknown>
  }

  interface IntrinsicElements extends Lynx.IntrinsicElements {
    input: InputProps;
  }
}

export interface InputProps extends StandardProps {
  /**
   * CSS class name for the input element
   */
  className?: string;

  value?: string;

  type?: 'text' | 'number' | 'digit' | 'password' | 'tel' | 'email';

  maxlength?: number;

  disabled?: boolean;

  /**
   * Event handler for input changes
   */
  bindinput?: (e: InputEvent) => void;

  /**
   * Event handler for blur events
   */
  bindblur?: (e: BlurEvent) => void;

  /**
   * Placeholder text when input is empty
   */
  placeholder?: string;

  /**
   * Text color of the input
   */
  'text-color'?: string;
}

export type InputEvent = BaseEvent<'input', { value: string }>;
export type BlurEvent = BaseEvent<'blur', Record<string, never>>;
