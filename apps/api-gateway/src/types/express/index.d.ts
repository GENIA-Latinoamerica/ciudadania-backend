//Declaration merging: allows you to add additional properties and methods to an existing type

// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      proxyTarjetUrl?: string;
      token?: any;
    }
  }
}
