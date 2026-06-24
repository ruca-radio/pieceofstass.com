/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { User } from './lib/auth';

declare global {
  namespace App {
    interface Locals {
      user?: User;
      runtime?: {
        env: Record<string, unknown>;
      };
    }
  }
}

export {};
