using backend.DTOs.Devices.Responses;
using backend.DTOs.UserGroups.Responses;
using backend.DTOs.Workspaces.Responses;

namespace backend.DTOs.Users.Responses
{
    public class UserDetailsResponse
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Firstname { get; set; } = string.Empty;
        public string Lastname { get; set; } = string.Empty;
        public IEnumerable<WorkspaceResponse> Workspaces { get; set; } = [];
        public IEnumerable<UserGroupResponse> UserGroups { get; set; } = [];
        public IEnumerable<BasicDeviceResponse> DeviceAccesses { get; set; } = [];
    }
}
