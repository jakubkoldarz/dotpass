using backend.DTOs.Devices.Responses;
using backend.DTOs.Users.Requests;
using backend.DTOs.Workspaces.Responses;

namespace backend.DTOs.UserGroups.Responses
{
    public class UserGroupDetailsResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public WorkspaceResponse? Workspace { get; set; }
        public IEnumerable<UserResponse> Members { get; set; } = [];
        public IEnumerable<BasicDeviceResponse> DeviceAccesses { get; set; } = [];
    }
}
