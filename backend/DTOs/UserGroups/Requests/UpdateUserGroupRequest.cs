using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.UserGroups.Requests
{
    public class UpdateUserGroupRequest
    {
        [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    }
}
