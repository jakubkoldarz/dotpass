using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Workspaces.Requests
{
    public class UpdateWorkspaceRequest
    {
        [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    }
}
