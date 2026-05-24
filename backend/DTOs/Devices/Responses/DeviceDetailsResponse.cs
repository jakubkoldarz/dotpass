using backend.DTOs.UserGroups.Responses;
using backend.DTOs.Users.Requests;
using backend.DTOs.Workspaces.Responses;

namespace backend.DTOs.Devices.Responses
{
    public class DeviceDetailsResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;
        public bool IsPublicInWorkspace { get; set; }
        public IEnumerable<WorkspaceResponse> Workspaces { get; set; } = [];
        public IEnumerable<UserResponse> UserAccesses { get; set; } = [];
        public IEnumerable<UserGroupResponse> GroupAccesses { get; set; } = [];
    }
}
