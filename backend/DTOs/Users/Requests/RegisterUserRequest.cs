using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Users.Requests
{
    public record RegisterUserRequest(

        [property: Required, EmailAddress]        string Email,
        [property: Required, StringLength(30)]    string Firstname,
        [property: Required, StringLength(30)]    string Lastname,
        [property: Required, MinLength(8)]        string Password
    );
}
