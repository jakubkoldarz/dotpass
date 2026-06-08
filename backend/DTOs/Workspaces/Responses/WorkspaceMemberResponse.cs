using backend.Models.Enums;

namespace backend.DTOs.Workspaces.Responses
{
    public class WorkspaceMemberResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public WorkspaceRole Role { get; set; }
    }
}
