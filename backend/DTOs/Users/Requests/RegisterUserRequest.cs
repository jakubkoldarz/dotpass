using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Users.Requests
{
    public record RegisterUserRequest(

        [Required][EmailAddress]        string Email,
        [Required][StringLength(30)]    string Firstname,
        [Required][StringLength(30)]    string Lastname,
        [Required][MinLength(8)]        string Password
    );
}
