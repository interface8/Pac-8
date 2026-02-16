export type { PermissionDto, CreatePermissionInput, UpdatePermissionInput } from "./types";
export { createPermissionSchema, updatePermissionSchema } from "./validation";
export * as permissionService from "./service";
export * as permissionRepository from "./repository";
