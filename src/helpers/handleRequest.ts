import { Request, Response } from 'express';
import { RequestHandler } from '../@types/common.types';

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
