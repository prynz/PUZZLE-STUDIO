// Metro resolves image imports to a numeric asset id (same declaration as apps/mobile/env.d.ts).
declare module '*.png' {
  const asset: number;
  export default asset;
}
declare module '*.jpg' {
  const asset: number;
  export default asset;
}
