// // If your environment supports ES modules, use import syntax:
// import tailwindScrollbar from 'tailwind-scrollbar';

// export default {
//   plugins: [tailwindScrollbar],
//   theme: {
//     extend: {
//       // Custom scrollbar utilities
//       scrollbar: (theme) => ({
//         // You can define custom scrollbar variants if needed
//       }),
//     },
//   },
//   variants: {
//     scrollbar: ['rounded'],
//   },
//   // Add custom CSS for scrollbar-thin via @layer
//   corePlugins: {
//     // Enable all core plugins (default behavior)
//   },
// };

// // Note: scrollbar-thin and other custom scrollbar classes are handled by:
// 1. The tailwind-scrollbar plugin (provides scrollbar styling)
// 2. Custom CSS rules added via @layer directives in your CSS files
// If scrollbar-thin doesn't work, add this to your global CSS (e.g., src/index.css):
// @layer components {
//   .scrollbar-thin {
//     scrollbar-width: thin;
//   }
//   .scrollbar-thin::-webkit-scrollbar {
//     width: 6px;
//     height: 6px;
//   }
// }
