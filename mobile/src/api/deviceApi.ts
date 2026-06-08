import { axiosInstance } from "./axiosInstance";

export interface groupAccess {
    id: string;
    name: string;
    workspaceId: string;
}

export interface userAccess {
    email: string;
    firstname: string;
    id: string;
    lastname: string;
}

export interface workspaceObject {
    id: string;
    name: string;
}

export interface deviceResponse {
    id: string;
    isPublicInWorkspace?: boolean;
    macAddress: string;
    name?: string;
    workspaceId?: string;
    groupAccesses?: groupAccess[];
    userAccesses?: userAccess[];
    workspace?: workspaceObject;
}

export interface deviceUpdate {
    isPublicInWorkspace: boolean;
    name: string;
}

export interface deviceInfoShort {
    id: string;
    isPublicInWorkspace: boolean;
    macAddress?: string;
    name?: string;
    workspaceId?: string;
}

export interface deviceInfoMy {
    id: string;
    name?: string;
    isPublicInWorkspacce?: boolean;
}

// Admin + Mod + User
export async function getDeviceDetails(deviceId: string): Promise<deviceResponse> {
    const res = await axiosInstance.get<deviceResponse>(`/api/device/${deviceId}`)
    return res.data;
}

// Admin + Mod
export async function updateDevice(deviceId: string, updating: deviceUpdate): Promise<deviceInfoShort> {
    const res = await axiosInstance.put<deviceInfoShort>(`/api/device/${deviceId}`, {updating})
    return res.data;
}

// Admin
export async function getAllDevices(): Promise<deviceInfoShort[]> {
    const res = await axiosInstance.get<deviceInfoShort[]>(`/api/device`)
    return res.data;
}

// Admin + Mod + User
export async function getWorkspaceDevices(workspaceId: string,): Promise<deviceInfoShort[]> {
    const res = await axiosInstance.get<deviceInfoShort[]>(`/api/device/${workspaceId}`)
    return res.data;
}

// Admin + Mod
export async function assignDevice(workspaceId: string, deviceId: string): Promise<number> {
    const res = await axiosInstance.post<number>(`/api/device/${deviceId}/assign`, {workspaceId})
    return res.status;
}

// Admin + Mod
export async function deleteDevice(deviceId: string): Promise<number> {
    const res = await axiosInstance.post<number>(`/api/device/${deviceId}/remove`)
    return res.status;
}

// Admin + Mod
export async function accessGrantDevice(deviceId: string, userId: string): Promise<number> {
    const res = await axiosInstance.post<number>(`/api/device/${deviceId}/user-access`, {userId})
    return res.status;
}

// Admin + Mod
export async function accessDenyDevice(deviceId: string, userId: string): Promise<number> {
    const res = await axiosInstance.delete<number>(`/api/device/${deviceId}/user-access`, {data: {userId}})
    return res.status;
}

// Admin + Mod
export async function accessGrantDeviceGroup(deviceId: string, userGroupId: string): Promise<number> {
    const res = await axiosInstance.post<number>(`/api/device/${deviceId}/group-access`, {userGroupId})
    return res.status;
}

// Admin + Mod
export async function accessDenyDeviceGroup(deviceId: string, userGroupId: string): Promise<number> {
    const res = await axiosInstance.delete<number>(`/api/device/${deviceId}/group-access`, {data:{ userGroupId}})
    return res.status;
}

// Admin + Mod + User
export async function getMyDevices(): Promise<deviceInfoMy[]> {
    const res = await axiosInstance.get<deviceInfoMy[]>(`/api/device/my`)
    return res.data;
}

// Admin + Mod + User
export async function openDoor(deviceId: string, time: number): Promise<number> {
    const res = await axiosInstance.post<number>(`/api/device/${deviceId}/activate/${time}`)
    return res.status;
}