using backend.DTOs.UserGroups.Responses;
using backend.DTOs.Users.Requests;
using backend.DTOs.Workspaces.Responses;
using backend.Models;
using backend.Models.Enums;

namespace backend.DTOs.Devices.Responses
{
    public class DeviceDetailsResponse
    {
        public Guid Id { get; set; }
        public string? Name { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;
        public bool? IsPublicInWorkspace { get; set; }
        public UnlockMode UnlockMode { get; set; }
        public Guid? WorkspaceId { get; set; }
        public WorkspaceResponse? Workspace { get; set; }
        public IEnumerable<UserResponse> UserAccesses { get; set; } = [];
        public IEnumerable<UserGroupResponse> GroupAccesses { get; set; } = [];
    }
}
