#!/usr/bin/env node
/*
  sl-create field generator
  Usage:
    - npm run sl-create:field FieldName
*/

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createFieldComponentTsx,
  createFieldConfigTs,
  createFieldScss,
  createFieldTypesTs,
  getFieldsPaths,
  parseNameFromArgs,
  safeName,
  toLowerCamelCase,
  toPascalCase,
} from "./utils.mjs";

async function main() {
  const { help, name } = parseNameFromArgs({ flag: "-f" });
  if (help) {
    console.log("Usage: npm run sl-create:field FieldName");
    process.exit(0);
  }

  if (!name) {
    console.error(
      "Error: Missing field name. Use the dedicated script: npm run sl-create:field FieldName",
    );
    process.exit(1);
  }

  const safe = safeName(name);
  if (!safe) {
    console.error("Error: Invalid field name.");
    process.exit(1);
  }

  const exportConstName = toPascalCase(safe) || "Field";
  const fieldName = toLowerCamelCase(exportConstName);

  const { fieldsDir } = getFieldsPaths();
  const newFieldDir = resolve(fieldsDir, fieldName);
  if (existsSync(newFieldDir)) {
    console.error(`Error: Field folder already exists at ${newFieldDir}`);
    process.exit(1);
  }

  mkdirSync(newFieldDir, { recursive: true });

  const indexPath = resolve(newFieldDir, "index.ts");
  const componentPath = resolve(newFieldDir, `${exportConstName}Component.tsx`);
  const typesPath = resolve(newFieldDir, "types.ts");
  const scssPath = resolve(newFieldDir, "index.scss");

  writeFileSync(indexPath, createFieldConfigTs(exportConstName, fieldName), "utf8");
  writeFileSync(componentPath, createFieldComponentTsx(exportConstName), "utf8");
  writeFileSync(typesPath, createFieldTypesTs(exportConstName), "utf8");
  writeFileSync(scssPath, createFieldScss(fieldName), "utf8");

  console.log(`\nCreated field:`);
  console.log(`- ${indexPath}`);
  console.log(`- ${componentPath}`);
  console.log(`- ${typesPath}`);
  console.log(`- ${scssPath}`);
  console.log(`\nTo use this field in a collection, import and add it to your fields array:`);
  console.log(`import { ${fieldName}Field } from '@/fields/${fieldName}'`);
  console.log(`\nfields: [`);
  console.log(`  ${fieldName}Field(),`);
  console.log(`  // ... other fields`);
  console.log(`]`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
