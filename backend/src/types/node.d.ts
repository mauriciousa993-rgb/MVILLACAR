declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      MONGODB_URI?: string;
      JWT_SECRET?: string;
    }
    
    interface Process {
      env: ProcessEnv;
      exit(code?: number): never;
      cwd(): string;
      on(event: string, listener: (...args: any[]) => void): void;
    }
  }

  var process: NodeJS.Process;
  var __dirname: string;
  var __filename: string;
  
  function require(id: string): any;
  namespace console {
    function log(...args: any[]): void;
    function error(...args: any[]): void;
    function warn(...args: any[]): void;
    function info(...args: any[]): void;
  }
}

declare module 'path' {
  namespace path {
    function join(...paths: string[]): string;
    function resolve(...paths: string[]): string;
    function dirname(p: string): string;
  }
  export = path;
}

declare module 'fs' {
  namespace fs {
    function existsSync(path: string): boolean;
    function mkdirSync(path: string, options?: any): string;
    function writeFileSync(path: string, data: any): void;
  }
  export = fs;
}

export {};
