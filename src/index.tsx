import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 如果你有全局 CSS，确保在这里引入
// import './index.css'; 

const initApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Critical: Could not find root element 'root' to mount React.");
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// 安全挂载机制：确保在浏览器解析完 HTML 后再执行 React 注入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}