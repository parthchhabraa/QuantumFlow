import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const generateToken: (payload: {
    id: string;
    email: string;
}) => string;
export declare const generateRefreshToken: (payload: {
    id: string;
    email: string;
}) => string;
//# sourceMappingURL=auth.d.ts.map