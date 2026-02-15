import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // 配置中间件处理路由
        middlewareMode: false,
        proxy: {},
      },
      plugins: [
        react(),
        // 自定义插件处理路由重写
        {
          name: 'html-route-handler',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              // 处理 /service 路由
              if (req.url === '/service' || req.url === '/service/') {
                req.url = '/pages/Service.html';
              }
              // 处理 /cases 路由
              else if (req.url === '/cases' || req.url === '/cases/') {
                req.url = '/pages/cases.html';
              }
              next();
            });
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
      }
    };
});
