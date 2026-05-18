using backend.DTOs.Users.Requests;
using backend.Models;

namespace backend.Interfaces
{
    public interface IAuthService
    {
        Task<UserResponse> RegisterAsync(RegisterUserRequest request);
        Task<User> LoginAsync(LoginUserRequest request);
    }
}
