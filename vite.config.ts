import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When building in GitHub Actions, set base to the repo name so all asset
// paths are relative to https://basone01.github.io/react-jq-cloud/
const base = process.env.GITHUB_ACTIONS ? '/react-jq-cloud/' : '/';

export default defineConfig({
  plugins: [react()],
  base,
});
