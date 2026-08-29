/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './public/user-dashboard.html',
    './public/app.js',
    './public/user-dashboard-app.js',
  ],
  theme: { extend: {} },
  corePlugins: { preflight: false },
};
