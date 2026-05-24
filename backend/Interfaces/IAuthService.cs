using backend.DTOs.Users.Requests;
using backend.DTOs.Users.Responses;

namespace backend.Interfaces
{
    public interface IAuthService
    {
        Task<JwtResponse> RegisterAsync(RegisterUserRequest request);
        Task<TokensResponse> LoginAsync(LoginUserRequest request);
        Task<TokensResponse> RefreshAsync(string refreshToken);
        Task LogoutAsync(Guid userId);
        Task<UserDetailsResponse> UserDetailsAsync(Guid userId);
    }
}
