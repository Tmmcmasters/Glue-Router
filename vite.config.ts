import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        dts({
            rollupTypes: true
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'glue-router',
            fileName: (format) => `glue-router.${format}.js`,
            formats: ["es", "cjs"] // ESM and CommonJS
        },
        sourcemap: true,
        emptyOutDir: true
    }
})