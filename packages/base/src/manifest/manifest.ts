import { ZodSchema } from 'zod';

type ManifestBackendAction = {
  input: ZodSchema;
  output: ZodSchema;
};

type ManifestBackendActions = Record<string, ManifestBackendAction>;

type ManifestBackend = {
  main: string;
  actions: ManifestBackendActions;
};

type ManifestFrontend = {
  main: string;
};

type Manifest = {
  id: string;
  name: string;
  version: string;
  description?: string;
  icon?: string;
  config: ZodSchema;
  frontend?: ManifestFrontend;
  backend?: ManifestBackend;
};

export {
  type Manifest,
  type ManifestBackendAction,
  type ManifestBackendActions,
  type ManifestBackend,
  type ManifestFrontend,
};
