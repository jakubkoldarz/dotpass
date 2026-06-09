import { userRole } from "../stores/authStore";
import { axiosInstance } from "./axiosInstance";

export interface WorkspaceResponse {
    id: string;
    name: string;
}

export interface device {
    id: string;
    isPublicWorkspace?: boolean;
    name?: string;
}

export interface userGroup {
    id: string;
    name: string;
    workspaceId: string;
}

export interface workspaceMember {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
}

export interface WorkspaceDetailsResponse {
    id: string;
    name: string;
    code: string;
    devices?: device[];
    userGroups?: userGroup[];
    workspaceMembers?: workspaceMember[];
}

export interface moderateMemberPayload {
    userId: string;
    role: userRole;
}

// Admin only
export async function getWorkspaces(): Promise<WorkspaceResponse[]> {
    const res = await axiosInstance.get<WorkspaceResponse[]>('/api/workspace')
    return res.data;
}

// Admin only
export async function createWorkspace(name: string): Promise<WorkspaceResponse> {
    const res = await axiosInstance.post<WorkspaceResponse>('/api/workspace', {name});
    return res.data;
}

// Admin + Mod
export async function getWorkspace(uuid: string): Promise<WorkspaceDetailsResponse> {
    const res = await axiosInstance.get<WorkspaceDetailsResponse>(`/api/workspace/${uuid}`);
    return res.data;
}

// Admin only
export async function deleteWorkspace(uuid: string): Promise<number> {
    const res = await axiosInstance.delete<number>(`/api/workspace/${uuid}`);
    return res.status;
}

// Admin only
export async function updateWorkspace(uuid: string, name: string): Promise<WorkspaceResponse> {
    const res = await axiosInstance.put<WorkspaceResponse>(`/api/workspace/${uuid}`, {name});
    return res.data;
}

// Admin + Mod + User
export async function getWorkspaceMembers(uuid: string): Promise<workspaceMember[]> {
    const res = await axiosInstance.get<workspaceMember[]>(`/api/workspace/${uuid}/members`);
    return res.data;
}

// Admin + Mod
export async function addWorkspaceMember(uuid: string, member: moderateMemberPayload): Promise<number> {
    const res = await axiosInstance.post<number>(`/api/workspace/${uuid}/members`, {member});
    return res.status;
}

// Admin + Mod
export async function updateWorkspaceMember(uuid: string, member: moderateMemberPayload): Promise<number> {
    const res = await axiosInstance.put<number>(`/api/workspace/${uuid}/members`, {userId: member.userId, role: member.role});
    return res.status;
}

// Admin + Mod
export async function deleteWorkspaceMember(uuid: string, userId: string): Promise<number> {
    const res = await axiosInstance.delete<number>(`/api/workspace/${uuid}/members`, { data: { userId }});
    return res.status;
}

// Admin + Mod + User
export async function joinWorkspace(code: string): Promise<number> {
    const res = await axiosInstance.post<number>(`/api/workspace/join/${code}`);
    return res.status;
}