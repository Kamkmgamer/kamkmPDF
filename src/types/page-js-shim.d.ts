/* eslint-disable @typescript-eslint/no-explicit-any */
// Allow imports that reference compiled page.js modules (used by Next.js type generation)
declare module "*page.js" {
  const Component: any;
  export default Component;
}

declare module "*route.js" {
  // Provide named exports commonly expected for Next route handlers
  export const GET: any;
  export const POST: any;
  export const PUT: any;
  export const DELETE: any;
  const _default: any;
  export default _default;
}

declare module "*layout.js" {
  const Layout: any;
  export default Layout;
}

declare module "*page.server.js" {
  const server: any;
  export default server;
}
