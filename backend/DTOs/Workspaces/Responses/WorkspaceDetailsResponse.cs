using backend.DTOs.Devices.Responses;
using backend.DTOs.UserGroups.Responses;
using backend.DTOs.Users.Requests;

namespace backend.DTOs.Workspaces.Responses
{
    public class WorkspaceDetailsResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public IEnumerable<UserGroupResponse> UserGroups { get; set; } = [];
        public IEnumerable<BasicDeviceResponse> Devices { get; set; } = [];
        public IEnumerable<UserResponse> WorkspaceMembers { get; set; } = [];
    }
}
