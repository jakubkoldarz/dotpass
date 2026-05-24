using backend.DTOs.Devices.Requests;
using backend.DTOs.Devices.Responses;
using backend.Models.Enums;

namespace backend.Interfaces
{
    public interface IDeviceService
    {
        Task<DeviceDetailsResponse> GetSingleAsync(Guid deviceId);
        Task<IEnumerable<DeviceResponse>> GetAllAsync(Guid workspaceId);
        Task<DeviceResponse> UpdateAsync(Guid deviceId, UpdateDeviceRequest request);
        Task AssingAsync(Guid deviceId, Guid workspaceId);
        Task RemoveAsync(Guid deviceId);
        Task AddUserAccessAsync(Guid userId, Guid deviceId);
        Task RemoveUserAccessAsync(Guid userId, Guid deviceId);
        Task AddGroupAccessAsync(Guid userGroupId, Guid deviceId);
        Task RemoveGroupAccessAsync(Guid userGroupId, Guid deviceId);
        Task SyncBrokerAsync();
        Task<IEnumerable<BasicDeviceResponse>> GetAccessibleDevicesAsync(Guid userId);
        Task<DeviceAccessLevel> CheckAccessAsync(Guid? userId = null, Guid? workspaceId = null, Guid? deviceId = null);
    }
}
