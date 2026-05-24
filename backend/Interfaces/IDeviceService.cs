using backend.DTOs.Devices.Requests;
using backend.DTOs.Devices.Responses;

namespace backend.Interfaces
{
    public interface IDeviceService
    {
        Task<DeviceDetailsResponse> GetSingleAsync(Guid deviceId);
        Task<IEnumerable<DeviceResponse>> GetAllAsync(Guid workspaceId);
        Task<DeviceResponse> UpdateAsync(Guid deviceId, UpdateDeviceRequest request);
        Task RemoveAsync(Guid deviceId);
        Task AddUserAccessAsync(Guid userId, Guid deviceId);
        Task RemoveUserAccessAsync(Guid userId, Guid deviceId);
        Task AddGroupAccessAsync(Guid userGroupId, Guid deviceId);
        Task RemoveGroupAccessAsync(Guid userGroupId, Guid deviceId);
    }
}
