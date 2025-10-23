import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      email: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
