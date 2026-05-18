namespace backend.DTOs.Users.Responses
{
    public record TokensResponse(
        string JwtToken,
        string RefreshToken
    );
}
