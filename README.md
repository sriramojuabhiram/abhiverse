# Neural Nexus — 3D Portfolio OS

**Abhiram.S · Senior .NET Full-Stack Developer**

A first-person navigable 3D portfolio built with React Three Fiber, featuring a real-time AI clone powered by Claude.

---

## Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Copy Draco decoders (required for GLB loading)
cp -r node_modules/three/examples/jsm/libs/draco/gltf/ public/draco/

# 3. Set your API key — edit .env.local

# 4. Add the character model → public/character/abhiram.glb

# 5. Start dev server
npm run dev
```

---

## Zones

| Zone | Content |
|------|---------|
| **Core** | Character desk, home portals |
| **Lab** (East) | Three project terminals |
| **Network** (West) | 15 skill crystals + connection graph |
| **Archive** (North) | Career timeline corridor |

**Controls:** `WASD` move · Mouse look (click to lock) · `G` AI Clone · `Esc` exit

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ANTHROPIC_API_KEY` | **Yes** | Anthropic API key for Clone AI |
| `VITE_GITHUB_USERNAME` | No | GitHub username for terrain data |
| `VITE_GITHUB_TOKEN` | No | PAT to avoid rate limits |

---

## Tech Stack

React 19 · TypeScript 5.7 · Vite 6 · React Three Fiber 8.18 · Three.js 0.169 · Framer Motion 12 · Zustand 5 · XState 5 · Claude claude-sonnet-4 · Tailwind CSS 4

---

## Design System — "Obsidian Intelligence"

```css
--void:   #0a0a0f   /* background      */
--cyan:   #00f5ff   /* primary accent  */
--plasma: #ff3da0   /* secondary accent */
--volt:   #b4ff39   /* tertiary accent  */
```

Fonts: **Syne** · **Outfit** · **JetBrains Mono**

---

## Character Model Notes

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
