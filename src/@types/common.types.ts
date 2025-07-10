import { Request, Response, NextFunction } from 'express';

export interface CleanupParams {
  id: string;
}

export type AsyncControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export type RequestHandler = (req: Request, res: Response) => Promise<void>; 