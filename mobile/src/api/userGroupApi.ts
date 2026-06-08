import { axiosInstance } from "./axiosInstance";

export interface deviceAccess {
    id: string;
    isPublicInWorkspace?: boolean;
    name?: string;
}

export interface member {
    email: string;
    firstname: string;
    id: string;
    lastname: string;
}

export interface workspaceObject {
    id: string;
    name: string;
}

export interface groupDetails {
    deviceAccesses: deviceAccess[];
    id: string;
    members: member[];
    name: string;
    workspace?: workspaceObject;
}

export interface groupInfoShort {
    id: string;
    name: string;
    workspaceId: string;
}

// Admin + Mod + User
export async function getGroupDetails(userGroupId: string): Promise<groupDetails> {
    const res = await axiosInstance.get<groupDetails>(`/api/usergroup/${userGroupId}`)
    return res.data;
}

// Admin + Mod
export async function updateGroupDetails(userGroupId: string, name: string): Promise<groupDetails> {
    const res = await axiosInstance.put<groupDetails>(`/api/usergroup/${userGroupId}`, {name})
    return res.data;
}

// Admin + Mod
export async function deleteGroup(userGroupId: string): Promise<number> {
    const res = await axiosInstance.delete<number>(`/api/usergroup/${userGroupId}`)
    return res.status;
}

// Admin + Mod + User
export async function getGroupsWorkspace(workspaceId: string): Promise<groupInfoShort[]> {
    const res = await axiosInstance.get<groupInfoShort[]>(`/api/usergroup/workspace/${workspaceId}`)
    return res.data;
}

// Admin + Mod
export async function createGroupsWorkspace(workspaceId: string, name: string): Promise<groupInfoShort> {
    const res = await axiosInstance.post<groupInfoShort>(`/api/usergroup/workspace/${workspaceId}`, {name})
    return res.data;
}

// Admin + Mod 
export async function addUserToGroup(userGroupId: string, userId: string): Promise<number> {
    const res = await axiosInstance.post<number>(`/api/usergroup/${userGroupId}/members`, {userId})
    return res.status;
}

// Admin + Mod 
export async function deleteUserFromGroup(userGroupId: string, userId: string): Promise<number> {
    const res = await axiosInstance.delete<number>(`/api/usergroup/${userGroupId}/members`, {data: {userId}})
    return res.status;
}