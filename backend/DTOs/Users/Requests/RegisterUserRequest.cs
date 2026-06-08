using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Users.Requests
{
    public class RegisterUserRequest
    {
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        [Required, StringLength(30)] public string Firstname { get; set; } = string.Empty;
        [Required, StringLength(30)] public string Lastname { get; set; } = string.Empty;
        [Required, MinLength(8)] public string Password { get; set; } = string.Empty;
    }
}
