using backend.DTOs.Users.Requests;
using backend.DTOs.Users.Responses;

namespace backend.Interfaces
{
    public interface IAuthService
    {
        Task<UserResponse> RegisterAsync(RegisterUserRequest request);
        Task<TokensResponse> LoginAsync(LoginUserRequest request);
    }
}
