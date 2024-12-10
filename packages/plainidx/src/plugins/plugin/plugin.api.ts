import { z, ZodSchema } from 'zod';

type PluginActionApi = Record<
  string,
  {
    input?: ZodSchema;
    output?: ZodSchema;
    handle?: (input: any) => Promise<any>;
  }
>;

const createActionApiRoute = <TInput extends ZodSchema = ZodSchema, TOutput extends ZodSchema = ZodSchema>(options: {
  input?: TInput;
  output?: TOutput;
  handle?: (input: z.infer<TInput>) => Promise<z.infer<TOutput>>;
}) => options satisfies PluginActionApi[string];

export { type PluginActionApi, createActionApiRoute };
