import coreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
    ...coreWebVitals,
    {
        ignores: [".next/**", ".next-build/**", ".next-dev2/**", "node_modules/**", "next-env.d.ts", ".agent-logs/**"],
    },
];

export default eslintConfig;
