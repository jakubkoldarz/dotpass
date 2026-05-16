using backend.DTOs.Users.Requests;
using backend.Interfaces;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        public Task<UserResponse> LoginAsync(LoginUserRequest request)
        {
            throw new NotImplementedException();
        }

        public Task<UserResponse> RegisterAsync(RegisterUserRequest request)
        {
            throw new NotImplementedException();
        }
    }
}
