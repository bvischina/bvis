import path from 'path';
import { resolve } from 'path'; // 必须引入这个
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        middlewareMode: false,
        proxy: {},
      },
      plugins: [
        react(),
        // Gzip 压缩插件 - 优化传输大小
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240, // 只压缩大于 10KB 的文件
          algorithm: 'gzip',
          ext: '.gz',
          deleteOriginFile: false, // 保留原文件
        }),
        // Brotli 压缩插件 - 更好的压缩率
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'brotliCompress',
          ext: '.br',
          deleteOriginFile: false,
        }),
        // 本地开发时的路由处理（保持不变）
        {
          name: 'html-route-handler',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              if (req.url === '/service' || req.url === '/service/') {
                req.url = '/pages/Service.html';
              }
              else if (req.url === '/cases' || req.url === '/cases/') {
                req.url = '/pages/cases.html';
              }
              next();
            });
          }
        },
        // Vite 会自动复制 public 目录下的文件到 dist,所以不需要手动复制
        // 但为了确保文件存在,我们保留这个插件作为备份
        {
          name: 'copy-config-files',
          closeBundle() {
            try {
              copyFileSync('_redirects', 'dist/_redirects');
              console.log('✅ _redirects file copied to dist/');
            } catch (err) {
              console.error('❌ Failed to copy _redirects:', err);
            }
            try {
              copyFileSync('_headers', 'dist/_headers');
              console.log('✅ _headers file copied to dist/');
            } catch (err) {
              console.error('❌ Failed to copy _headers:', err);
            }
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      // ⬇️⬇️⬇️ 核心修复：添加多页面入口配置 ⬇️⬇️⬇️
      build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
            service: resolve(__dirname, 'public/pages/Service.html'), // 确保文件名大小写完全一致
            cases: resolve(__dirname, 'public/pages/cases.html'),
            // 如果还有其他页面，继续在这里添加
            // map: resolve(__dirname, 'public/pages/map.html'),
          },
        },
      },
    };
});
