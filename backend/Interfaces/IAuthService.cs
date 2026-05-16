using backend.DTOs.Users.Requests;

namespace backend.Interfaces
{
    public interface IAuthService
    {
        Task<UserResponse> RegisterAsync(RegisterUserRequest request);
        Task<UserResponse> LoginAsync(LoginUserRequest request);
    }
}
