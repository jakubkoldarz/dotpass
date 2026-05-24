using backend.DTOs.Devices.Requests;
using backend.DTOs.Devices.Responses;
using backend.Interfaces;

namespace backend.Services
{
    public class DeviceService : IDeviceService
    {
        public Task AddGroupAccessAsync(Guid userGroupId, Guid deviceId)
        {
            throw new NotImplementedException();
        }

        public Task AddUserAccessAsync(Guid userId, Guid deviceId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<DeviceResponse>> GetAllAsync(Guid workspaceId)
        {
            throw new NotImplementedException();
        }

        public Task<DeviceDetailsResponse> GetSingleAsync(Guid deviceId)
        {
            throw new NotImplementedException();
        }

        public Task RemoveAsync(Guid deviceId)
        {
            throw new NotImplementedException();
        }

        public Task RemoveGroupAccessAsync(Guid userGroupId, Guid deviceId)
        {
            throw new NotImplementedException();
        }

        public Task RemoveUserAccessAsync(Guid userId, Guid deviceId)
        {
            throw new NotImplementedException();
        }

        public Task<DeviceResponse> UpdateAsync(Guid deviceId, UpdateDeviceRequest request)
        {
            throw new NotImplementedException();
        }
    }
}
