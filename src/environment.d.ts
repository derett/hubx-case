declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      HOST: string;
      REMOTE: string;
      DATABASE_URI: string;
    }
  }
}

export {};
