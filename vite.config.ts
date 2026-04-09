import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function safeCopyPublicPlugin() {
  return {
    name: 'safe-copy-public',
    apply: 'build' as const,
    enforce: 'post' as const,
    closeBundle() {
      const publicDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(publicDir)) return;
      const files = fs.readdirSync(publicDir);
      for (const file of files) {
        if (file.includes(' ')) continue;
        const src = path.join(publicDir, file);
        const dest = path.join(distDir, file);
        try {
          fs.copyFileSync(src, dest);
        } catch {}
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), safeCopyPublicPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  publicDir: false,
  resolve: {
    alias: [
      {
        find: /^\.\/phoenix\/.*/,
        replacement: path.resolve(__dirname, 'src/lib/phoenixStub.ts'),
      },
    ],
  },
});