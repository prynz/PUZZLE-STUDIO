/// <reference types="expo/types" />

// Metro resolves image imports to a numeric asset id.
declare module '*.png' {
  const asset: number;
  export default asset;
}
declare module '*.jpg' {
  const asset: number;
  export default asset;
}
