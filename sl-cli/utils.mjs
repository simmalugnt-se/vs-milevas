import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export function safeName(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Allow letters, numbers, and - _
  const valid = trimmed.replace(/[^a-zA-Z0-9-_]/g, "");
  return valid;
}

export function toPascalCase(input) {
  if (!input) return "";
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export function toLowerCamelCase(pascal) {
  if (!pascal) return "";
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function createUiWrapper(labelText, headingExpr = "{title}") {
  return `    <div className="relative border border-dashed rounded-md p-6 md:p-8">
      <span className="absolute top-2 left-2 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded px-2 py-0.5">
        ${labelText}
      </span>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold">${headingExpr}</h2>
      </div>
    </div>`;
}

export function getPaths() {
  const root = resolve(__dirname, "..");
  const blocksDir = resolve(root, "src/payload/blocks");
  const collectionsDir = resolve(root, "src/payload/collections");
  const componentsDir = resolve(root, "src/components");
  const contextsDir = resolve(root, "src/contexts");
  const globalsDir = resolve(root, "src/payload/globals");
  const utilitiesDir = resolve(root, "src/utilities");
  return {
    root,
    blocksDir,
    collectionsDir,
    componentsDir,
    contextsDir,
    globalsDir,
    utilitiesDir,
  };
}

export function getApiPaths() {
  const root = resolve(__dirname, "..");
  const apiDir = resolve(root, "src/app/routes");
  return { root, apiDir };
}

export function getFieldsPaths() {
  const root = resolve(__dirname, "..");
  const fieldsDir = resolve(root, "src/payload/fields");
  return { root, fieldsDir };
}

export function parseNameFromArgs({ flag }) {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) return { help: true };

  // 1) Prefer explicit flag (e.g., -b Name or -c Name)
  if (flag) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1] && !String(args[idx + 1]).startsWith("-")) {
      return { name: args[idx + 1] };
    }
  }

  // 2) If npm set the flag as boolean true (npm_config_x=true), pick first positional
  const envFlag = flag ? process.env[`npm_config_${flag.replace("-", "")}`] : null;
  const positionalArgs = args.filter((v) => v && !v.startsWith("-"));
  if (envFlag === "true" && positionalArgs[0]) return { name: positionalArgs[0] };

  // 3) Fallback: first positional as name
  if (positionalArgs[0]) return { name: positionalArgs[0] };

  return { name: null };
}

export function runGenerateTypes(root) {
  execSync("pnpm run generate:types", {
    cwd: root,
    env: {
      ...process.env,
      DATABASE_URI:
        process.env.DATABASE_URI ||
        process.env.DATABASE_URL ||
        "postgres://postgres:postgres@localhost:5432/payload",
      DATABASE_URI_DIRECT:
        process.env.DATABASE_URI_DIRECT ||
        process.env.DATABASE_URI ||
        process.env.DATABASE_URL ||
        "postgres://postgres:postgres@localhost:5432/payload",
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || "sl-cli-generate-types-secret",
    },
    stdio: "inherit",
  });
}

export function createBlockConfigTs(slug, interfaceName, exportConstName) {
  return `import type { Block } from 'payload'

export const ${exportConstName}Block: Block = {
  slug: '${slug}',
  interfaceName: '${interfaceName}',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
  labels: {
    singular: '${exportConstName}',
    plural: '${exportConstName}s',
  },
}
`;
}

export function createBlockComponentTsx(componentName, blockTypeName, blockSlug, label) {
  return `import type { LayoutBlock, LayoutBlockComponentProps } from '../types'

type ${blockTypeName} = Extract<LayoutBlock, { blockType: '${blockSlug}' }>

export function ${componentName}({ block }: LayoutBlockComponentProps<${blockTypeName}>) {
  return (
    <section
      className="relative border border-dashed rounded-md p-6 md:p-8"
      aria-label="${label} block"
    >
      <span
        className="absolute top-2 left-2 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded px-2 py-0.5"
        aria-hidden="true"
      >
        Block: ${label}
      </span>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold">{block.title}</h2>
      </div>
    </section>
  )
}
`;
}

export function createGenericComponentIndexTsx(exportName) {
  const propsName = `${exportName}Props`;
  const body = createUiWrapper(`Component: ${exportName}`);
  return `import React from 'react'

export type ${propsName} = {
  title: string
  // Accessibility props
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

export const ${exportName}: React.FC<${propsName}> = ({
  title,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ...props
}) => {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      {...props}
    >
${body}
    </section>
  )
}
`;
}

export function createContextIndexTsx(exportName) {
  const contextVar = `${exportName}Context`;
  const providerName = `${exportName}Provider`;
  const hookName = `use${exportName}`;
  const contextType = `${exportName}ContextType`;
  return `'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type ${contextType} = {
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
};

const ${contextVar} = createContext<${contextType} | undefined>(undefined);

export function ${providerName}({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  return (
    <${contextVar}.Provider value={{ enabled, setEnabled }}>
      {children}
    </${contextVar}.Provider>
  );
}

export function ${hookName}() {
  const context = useContext(${contextVar});
  if (context === undefined) {
    throw new Error('${hookName} must be used within a ${providerName}');
  }
  return context;
}
`;
}

export function createFieldConfigTs(exportConstName, fieldName) {
  return `import type { JSONField } from 'payload'
import type { ${exportConstName}Data } from './types'

type Overrides = {
  ${fieldName}Overrides?: Partial<JSONField>
}

type ${exportConstName}Field = (overrides?: Overrides) => JSONField & {
  name: string
  type: 'json'
  typescript?: {
    interface: ${exportConstName}Data
  }
}

export { type ${exportConstName}Data } from './types'

export const ${fieldName}Field: ${exportConstName}Field = (overrides = {}) => {
  const { ${fieldName}Overrides } = overrides

  const ${fieldName}FieldConfig: JSONField = {
    name: '${fieldName}',
    type: 'json' as const,
    label: '${exportConstName}',
    ...(${fieldName}Overrides || {}),
    admin: {
      ...(${fieldName}Overrides?.admin || {}),
      components: {
        Field: '/payload/fields/${fieldName}/${exportConstName}Component#${exportConstName}Component',
      },
    },
    typescriptSchema: [
      ({ jsonSchema }) => ({
        ...jsonSchema,
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['id', 'name', 'value'],
        additionalProperties: false,
      }),
    ],
  }

  return ${fieldName}FieldConfig
}
`;
}

export function createFieldComponentTsx(exportConstName) {
  const fieldName = toLowerCamelCase(exportConstName);
  return `'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import React, { useState } from 'react'
import { ${exportConstName}Data } from './types'
import './index.scss'

export const ${exportConstName}Component: React.FC = () => {
  const { value, setValue } = useField<${exportConstName}Data>()
  const [options] = useState<${exportConstName}Data[]>([
    { id: 1, name: 'Option One', value: 'option-one' },
    { id: 2, name: 'Option Two', value: 'option-two' },
    { id: 3, name: 'Option Three', value: 'option-three' },
    { id: 4, name: 'Option Four', value: 'option-four' },
  ])

  // Example: Fetch options from an API
  // useEffect(() => {
  //   const fetchOptions = async () => {
  //     try {
  //       const response = await fetch('/api/${fieldName}-data')
  //       const data = await response.json()
  //       setOptions(data.options)
  //     } catch (error) {
  //       console.error('Failed to fetch options:', error)
  //     }
  //   }
  //   fetchOptions()
  // }, [])

  return (
    <div className="${fieldName}-field-component">
      <FieldLabel label="${exportConstName} Data" />
      <select
        value={value?.value || ''}
        onChange={(e) => {
          if (e.target.value === '') {
            setValue(null)
          } else {
            const selectedOption = options.find((opt) => opt.value === e.target.value)
            if (selectedOption) {
              setValue(selectedOption)
            }
          }
        }}
        className="${fieldName}-select"
      >
        <option value="">Select an option...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}
`;
}

export function createFieldTypesTs(exportConstName) {
  return `// ${exportConstName} field interface
export interface ${exportConstName}Data {
  id: number
  name: string
  value: string
}
`;
}

export function createFieldScss(fieldName) {
  return `.${fieldName}-field-component {
  display: flex;
  flex-direction: column;
  gap: 5px;

  .${fieldName}-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--theme-elevation-400);
    border-radius: 4px;
    font-size: 1rem;
    background-color: var(--theme-elevation-0);
    color: var(--theme-text);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--theme-elevation-500);
    }

    &:focus {
      outline: none;
      border-color: var(--theme-success-500);
      box-shadow: 0 0 0 2px var(--theme-success-100);
    }

    option {
      background-color: var(--theme-elevation-0);
      color: var(--theme-text);
    }
  }
}
`;
}

export function createApiRouteTs(routeName) {
  return `import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /routes/${routeName}
 *
 * Example API route handler for Next.js 15+
 * Following Next.js App Router conventions with Route Handlers
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Access search params from the request URL
    const { searchParams } = new URL(request.url)
    const exampleParam = searchParams.get('example')

    // Example: Access request headers
    const userAgent = request.headers.get('user-agent')

    // Your API logic here
    const data = {
      message: 'Success',
      timestamp: new Date().toISOString(),
      params: { exampleParam },
      userAgent,
    }

    // Return JSON response with appropriate status
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error in GET /routes/${routeName}:', error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /routes/${routeName}
 *
 * Example POST handler
 * Uncomment to enable POST requests
 */
/*
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse JSON body
    const body = await request.json()

    // Your API logic here
    const result = {
      message: 'Data received',
      receivedData: body,
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /routes/${routeName}:', error)

    return NextResponse.json(
      {
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}
*/
`;
}
