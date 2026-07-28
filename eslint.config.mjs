import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

// eslint-config-next v16 ships native flat configs, so they are spread
// directly. Routing them through FlatCompat (which converts legacy eslintrc
// configs) makes the eslintrc validator reject them, and it then crashes
// while serialising the plugins' circular `configs.flat` reference — which
// surfaces as "TypeError: Converting circular structure to JSON" rather than
// a usable error message.
const eslintConfig = [...nextCoreWebVitals, ...nextTypeScript];

export default eslintConfig;
