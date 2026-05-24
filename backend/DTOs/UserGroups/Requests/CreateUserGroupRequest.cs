using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.UserGroups.Requests
{
    public class CreateUserGroupRequest
    {
        [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    }
}
