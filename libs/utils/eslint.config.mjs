// ESLint flat config for TypeScript ESM (Bun)
// Rules based on exact formatting in service-now-router.mts as source of truth
// DO NOT change service-now-router.mts - it is the formatting template

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";
import stylistic from "@stylistic/eslint-plugin";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    ...tseslint.configs.recommended.map((c) => ({
        ...c,
        files: ["**/*.ts", "**/*.mts", "**/*.tsx"],
    })),
    {
        ignores: [
            "node_modules",
            "**/dist/**",
            "**/build/**",
            "**/.vscode/**",
            "**/.git/**",
            "**/iac/**",
            "**/infrastructure/**",
            "**/docs/**",
            "**/__azurite_db_*",
            "**/__blobstorage__/**",
            "**/__queuestorage__/**",
            "**/azurite/**",
            "**/azurite-data/**",
            "bun.lock",
            "bun.lockb",
        ],
    },
    {
        files: ["**/*.ts", "**/*.mts", "**/*.tsx"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: null,
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            jsdoc,
            "@typescript-eslint": tseslint.plugin,
            "@stylistic": stylistic,
        },
        settings: {
            jsdoc: {
                mode: "typescript",
            },
        },
        rules: {
            // Maximum line length: 100 characters
            // If exceeded, wrap to next line with +5 space indent from base
            "@stylistic/max-len": [
                "error",
                {
                    code: 100,
                    tabWidth: 2,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreRegExpLiterals: true,
                    ignoreComments: false,
                },
            ],

            // Indentation: OFF - source file uses custom indentation pattern
            // Manual code should follow the pattern in service-now-router.mts
            "@stylistic/indent": "off",

            "@stylistic/no-trailing-spaces": "error",
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/array-bracket-spacing": ["error", "never"],
            "@stylistic/computed-property-spacing": ["error", "never"],

            "@stylistic/space-before-function-paren": [
                "error",
                {
                    anonymous: "always",
                    named: "never",
                    asyncArrow: "always",
                },
            ],

            "@stylistic/keyword-spacing": ["error", { before: true, after: true }],
            "@stylistic/space-infix-ops": "error",
            "@stylistic/semi": ["error", "always"],

            "@stylistic/quotes": [
                "error",
                "double",
                {
                    avoidEscape: true,
                    allowTemplateLiterals: "always",
                },
            ],

            "@stylistic/comma-dangle": [
                "error",
                {
                    arrays: "always-multiline",
                    objects: "always-multiline",
                    imports: "always-multiline",
                    exports: "always-multiline",
                    functions: "never",
                },
            ],

            "@stylistic/comma-spacing": ["error", { before: false, after: true }],
            "@stylistic/comma-style": ["error", "last"],

            "@stylistic/lines-between-class-members": [
                "error",
                "always",
                { exceptAfterSingleLine: false },
            ],

            // Allow up to 2 blank lines (source file has double blank lines in places)
            "@stylistic/no-multiple-empty-lines": [
                "error",
                {
                    max: 2,
                    maxEOF: 0,
                    maxBOF: 0,
                },
            ],

            "@stylistic/eol-last": ["error", "always"],

            // Disable strict blank line rules that conflict with source formatting
            "@stylistic/padding-line-between-statements": "off",

            // Don't enforce import order (source has custom grouping)
            "sort-imports": "off",

            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    fixStyle: "separate-type-imports",
                },
            ],

            "@stylistic/arrow-parens": ["error", "always"],
            "@stylistic/arrow-spacing": ["error", { before: true, after: true }],

            "prefer-arrow-callback": "off",

            curly: ["error", "all"],

            "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: false }],

            camelcase: "off",

            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",

            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],

            "no-var": "error",
            "prefer-const": "error",
            "no-console": "warn",
            eqeqeq: ["error", "always"],
            "no-duplicate-imports": "error",
            "prefer-template": "off",
            "no-useless-concat": "error",

            "jsdoc/require-jsdoc": "off",
            "jsdoc/require-description": "off",
            "jsdoc/check-alignment": "warn",
            "jsdoc/check-indentation": "warn",
            "jsdoc/tag-lines": ["warn", "any", { startLines: 1, endLines: 0 }],
        },
    },
];
