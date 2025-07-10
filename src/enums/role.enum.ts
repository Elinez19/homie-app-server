// App User Roles
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ARTISAN = 'ARTISAN',
  ADMIN = 'ADMIN'
}

// Workspace Roles
export enum Roles {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum Permissions {
  CREATE_WORKSPACE = 'CREATE_WORKSPACE',
  EDIT_WORKSPACE = 'EDIT_WORKSPACE',
  DELETE_WORKSPACE = 'DELETE_WORKSPACE',
  MANAGE_WORKSPACE_SETTINGS = 'MANAGE_WORKSPACE_SETTINGS',
  
  ADD_MEMBER = 'ADD_MEMBER',
  CHANGE_MEMBER_ROLE = 'CHANGE_MEMBER_ROLE',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  
  CREATE_PROJECT = 'CREATE_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  
  CREATE_TASK = 'CREATE_TASK',
  EDIT_TASK = 'EDIT_TASK',
  DELETE_TASK = 'DELETE_TASK',
  
  VIEW_ONLY = 'VIEW_ONLY'
}

export enum PermissionType {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  UPDATE = 'UPDATE'
}

export type RoleType = Roles;

export interface PermissionInterface {
  [key: string]: PermissionType[];
}

export const RolePermissions: Record<RoleType, Array<Permissions>> = {
  [Roles.OWNER]: [
    Permissions.CREATE_WORKSPACE,
    Permissions.EDIT_WORKSPACE,
    Permissions.DELETE_WORKSPACE,
    Permissions.MANAGE_WORKSPACE_SETTINGS,
    Permissions.ADD_MEMBER,
    Permissions.CHANGE_MEMBER_ROLE,
    Permissions.REMOVE_MEMBER,
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.DELETE_PROJECT,
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.DELETE_TASK,
    Permissions.VIEW_ONLY,
  ],
  [Roles.ADMIN]: [
    Permissions.ADD_MEMBER,
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.DELETE_PROJECT,
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.DELETE_TASK,
    Permissions.MANAGE_WORKSPACE_SETTINGS,
    Permissions.VIEW_ONLY,
  ],
  [Roles.MEMBER]: [
    Permissions.VIEW_ONLY,
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
  ],
}; 