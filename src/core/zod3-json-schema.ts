/**
 * zod 3 → JSON Schema, for the agent-drivable layer (fli-core v0.7.0).
 *
 * Why this exists: Teletubby's input schemas (`INPUT`) are zod 3 — `z` comes
 * from `@appydave/core` — while fli-core's contracts, OpenRPC generator and
 * console page are zod 4. A contract needs a zod 4 `input`; fli-core's zod 4
 * rebuilds one from JSON Schema (`z.fromJSONSchema`). This converter is the
 * bridge, so `INPUT` stays THE schema: the object that refuses a bad call is
 * still the object the spec and the console describe. Hand-copying 30-odd
 * schemas into zod 4 would have made two truths that drift.
 *
 * Covers exactly what `INPUT` uses (object, string, number, boolean, enum,
 * array, optional, nullable, default, effects, describe, and the checks
 * min/max/regex/int/positive/nonnegative/finite). Anything else converts to
 * `{}` (accept anything) rather than guessing — `test/agent-layer.test.ts`
 * pins that no INPUT field falls through to it.
 */

import type { z } from '@appydave/core';

export type JsonSchema = Record<string, unknown>;

interface Def {
  typeName: string;
  innerType?: z.ZodTypeAny;
  schema?: z.ZodTypeAny;
  type?: z.ZodTypeAny;
  values?: readonly string[];
  shape?: () => Record<string, z.ZodTypeAny>;
  checks?: { kind: string; value?: unknown; inclusive?: boolean; regex?: RegExp }[];
  minLength?: { value: number } | null;
  maxLength?: { value: number } | null;
  defaultValue?: () => unknown;
  description?: string;
}

const defOf = (schema: z.ZodTypeAny): Def => (schema as unknown as { _def: Def })._def;

/** Types the converter did not recognise, collected so a test can refuse them. */
export const UNCONVERTED: string[] = [];

export function toJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  const def = defOf(schema);
  const out = convert(schema, def);
  if (schema.description && out.description === undefined) out.description = schema.description;
  return out;
}

function convert(schema: z.ZodTypeAny, def: Def): JsonSchema {
  switch (def.typeName) {
    case 'ZodOptional':
    case 'ZodEffects':
      return toJsonSchema((def.innerType ?? def.schema)!);
    case 'ZodDefault':
      return { ...toJsonSchema(def.innerType!), default: def.defaultValue!() };
    case 'ZodNullable':
      return { anyOf: [toJsonSchema(def.innerType!), { type: 'null' }] };
    case 'ZodString': {
      const out: JsonSchema = { type: 'string' };
      for (const check of def.checks ?? []) {
        if (check.kind === 'min') out.minLength = check.value;
        else if (check.kind === 'max') out.maxLength = check.value;
        else if (check.kind === 'regex' && check.regex) out.pattern = check.regex.source;
      }
      return out;
    }
    case 'ZodNumber': {
      const out: JsonSchema = { type: 'number' };
      for (const check of def.checks ?? []) {
        if (check.kind === 'int') out.type = 'integer';
        else if (check.kind === 'min')
          out[check.inclusive ? 'minimum' : 'exclusiveMinimum'] = check.value;
        else if (check.kind === 'max')
          out[check.inclusive ? 'maximum' : 'exclusiveMaximum'] = check.value;
        // `finite` has no JSON Schema form; JSON cannot carry Infinity anyway.
      }
      return out;
    }
    case 'ZodBoolean':
      return { type: 'boolean' };
    case 'ZodEnum':
      return { type: 'string', enum: [...(def.values ?? [])] };
    case 'ZodArray': {
      const out: JsonSchema = { type: 'array', items: toJsonSchema(def.type!) };
      if (def.minLength) out.minItems = def.minLength.value;
      if (def.maxLength) out.maxItems = def.maxLength.value;
      return out;
    }
    case 'ZodObject': {
      const shape = def.shape!();
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const [key, field] of Object.entries(shape)) {
        properties[key] = toJsonSchema(field);
        if (!field.isOptional()) required.push(key);
      }
      return required.length > 0
        ? { type: 'object', properties, required }
        : { type: 'object', properties };
    }
    default:
      UNCONVERTED.push(def.typeName);
      return {};
  }
}
