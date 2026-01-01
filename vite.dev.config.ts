import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    root: resolve(__dirname, "tests"),
    server: {
        port: 3000,
        open: true,
        cors: true,
    },
});
