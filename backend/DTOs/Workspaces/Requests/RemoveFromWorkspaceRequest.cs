using backend.Models.Enums;

namespace backend.DTOs.Workspaces.Requests
{
    public class RemoveFromWorkspaceRequest
    {
        public Guid UserId { get; set; }
    }
}
