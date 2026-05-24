using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.UserGroups.Requests
{
    public class UserGroupIdRequest
    {
        [Required]
        public Guid UserGroupId { get; set; }
    }
}
