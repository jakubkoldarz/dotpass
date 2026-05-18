using backend.DTOs.Users.Requests;
using backend.DTOs.Users.Responses;
using backend.Exceptions;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AuthService(ApplicationDbContext _db, ITokenService _tokenService) : IAuthService
    {
        public async Task<IEnumerable<UserResponse>> GetAllAsync()
        {
            var users = await _db.Users.ToListAsync();

            return users.Select(u => new UserResponse(
                u.Id,
                u.Email,
                u.Firstname,
                u.Lastname
            )).ToList();
        }

        public async Task<TokensResponse> LoginAsync(LoginUserRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if(user == null)
            {
                throw new BadRequestException("Invalid email address or password");
            }

            var isPassValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if(!isPassValid)
            {
                throw new BadRequestException("Invalid email address or password");
            }

            var jwtToken = _tokenService.CreateAccessToken(user);

            return new TokensResponse(jwtToken, user.RefreshToken!);
        }

        public async Task<UserResponse> RegisterAsync(RegisterUserRequest request)
        {
            var userExists = await _db.Users.AnyAsync(u => u.Email == request.Email);

            if (userExists) throw new BadRequestException("Email already in use");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Firstname = request.Firstname,
                Lastname = request.Lastname,
                Email = request.Email,
                PasswordHash = passwordHash,
                RefreshToken = _tokenService.CreateRefreshToken(),
                RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
            };
            
            var newUser = _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new UserResponse(user.Id, user.Firstname, user.Lastname, user.Email);
        }
    }
}
