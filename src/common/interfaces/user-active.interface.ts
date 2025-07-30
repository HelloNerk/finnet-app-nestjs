import { Role } from "../enums/role.enum";

export interface UserActiveInterface{
    email: string;
    ruc: string;
    role: Role
}