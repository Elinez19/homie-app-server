import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from '../config/http.config';

export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.loginAdmin({
    email: req.body.email,
    password: req.body.password
  });
  res.status(HTTPSTATUS.OK).json(result);
});

export const logoutAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.logoutAdmin(req.body.refreshToken);
  res.status(HTTPSTATUS.OK).json(result);
});

export const fetchAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.fetchAdmin(req.user!.id);
  res.status(HTTPSTATUS.OK).json(result);
});

export const requestAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.requestAccessToken(req.body.refreshToken);
  res.status(HTTPSTATUS.OK).json(result);
});

// Sub-admin management
export const createSubAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.createSubAdmin(req.body);
  res.status(HTTPSTATUS.CREATED).json(result);
});

export const updateSubAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.updateSubAdmin(req.params.adminId, req.body);
  res.status(HTTPSTATUS.OK).json(result);
});

export const toggleSuspendAdmin = asyncHandler(async (req: Request, res: Response) => {
  const action = req.body.action || 'suspend';
  const result = await adminService.toggleSuspendAdmin({
    adminId: req.params.adminId,
    action: action as 'suspend' | 'activate'
  });
  res.status(HTTPSTATUS.OK).json(result);
});

export const deleteSubAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.deleteSubAdmin(req.params.adminId);
  res.status(HTTPSTATUS.OK).json(result);
});

// User management
export const fetchAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.fetchAllUsers();
  res.status(HTTPSTATUS.OK).json(result);
});

export const fetchSingleUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.fetchSingleUser(req.params.userId);
  res.status(HTTPSTATUS.OK).json(result);
});

export const toggleSuspendAccount = asyncHandler(async (req: Request, res: Response) => {
  const action = req.body.action || 'suspend';
  const result = await adminService.toggleSuspendAccount({
    userId: req.params.userId,
    action: action as 'suspend' | 'activate'
  });
  res.status(HTTPSTATUS.OK).json(result);
}); 