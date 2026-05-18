namespace backend.DTOs.Users.Requests
{
    public record UserResponse(
        Guid Id,
        string Firstname,
        string Lastname,
        string Email
    );
}
