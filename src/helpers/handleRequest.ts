import { Request, Response } from 'express';

type RequestHandler = (req: Request, res: Response) => Promise<void>;

// Higher-order function to handle try/catch logic
export const handleRequest = (handler: RequestHandler) => {
	return async (req: Request, res: Response) => {
		try {
			await handler(req, res);
		} catch (error) {
			console.error('Request error:', error);
			res.status(500).json({ 
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	};
};
