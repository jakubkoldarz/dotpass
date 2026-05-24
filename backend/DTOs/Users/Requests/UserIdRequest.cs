using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Users.Requests
{
    public class UserIdRequest
    {
        [Required]
        public Guid UserId { get; set; }
    }
}
