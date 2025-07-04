import { createFrames } from 'frames.js/next'; // <--- CHANGED THIS LINE!

export const frames = createFrames({
  basePath: "/api/frames", // This should match your API route path
});
