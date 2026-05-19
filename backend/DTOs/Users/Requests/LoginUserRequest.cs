using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Users.Requests
{
    public record LoginUserRequest(
        [property: Required, EmailAddress] string Email,
        [property: Required, MinLength(8)] string Password
    );
}
