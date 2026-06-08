using backend.Models.Enums;

namespace backend.DTOs.Workspaces.Requests
{
    public class UpdateWorkspaceMemberRequest
    {
        public Guid UserId { get; set; }
        public WorkspaceRole Role { get; set; }
    }
}
