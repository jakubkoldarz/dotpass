using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Users.Requests
{
    public record LoginUserRequest(

        [Required][EmailAddress] string Email,
        [Required][MinLength(8)] string Password
    );
}
