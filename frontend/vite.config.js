import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: "../public",
        emptyOutDir: false, // Prevent deleting other Laravel public files
        manifest: true, // Generate manifest.json for Laravel
        rollupOptions: {
            output: {
                // Organize assets into subfolders
                entryFileNames: "assets/[name]-[hash].js",
                chunkFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash].[ext]",
            },
        },
    },
    plugins: [
        react(),
        {
            name: "clean-assets",
            buildStart: async () => {
                const fs = await import("fs");
                const path = await import("path");
                const assetsPath = path.resolve(__dirname, "../public/assets");

                if (fs.existsSync(assetsPath)) {
                    fs.rmSync(assetsPath, { recursive: true, force: true });
                    console.log("Cleaned public/assets directory");
                }
            },
        },
        {
            name: "move-index-html",
            closeBundle: async () => {
                const fs = await import("fs");
                const path = await import("path");

                const srcPath = path.resolve(__dirname, "../public/index.html");
                const destPath = path.resolve(
                    __dirname,
                    "../resources/views/app.blade.php"
                );

                if (fs.existsSync(srcPath)) {
                    // Read the file
                    let content = fs.readFileSync(srcPath, "utf-8");

                    // Ensure assets are loaded correctly from root
                    content = content.replace(/(src|href)="\//g, '$1="/');

                    // Write to blade view
                    fs.writeFileSync(destPath, content);

                    // Remove the original index.html from public
                    fs.unlinkSync(srcPath);

                    console.log(
                        "Moved index.html to resources/views/app.blade.php"
                    );
                }
            },
        },
    ],
});
