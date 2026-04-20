import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/users-with-orders': {
//         target: 'http://localhost:3000', // Adjust this to your API Gateway URL
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// });

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
