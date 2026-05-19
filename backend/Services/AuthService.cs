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

            user.RefreshToken = _tokenService.CreateRefreshToken();
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await _db.SaveChangesAsync();

            var jwtToken = _tokenService.CreateAccessToken(user);

            return new TokensResponse(jwtToken, user.RefreshToken!);
        }

        public async Task<TokensResponse> RefreshAsync(string refreshToken)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if(user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            {
                throw new UnauthorizedException("Session expired. Please login again.");
            }
            
            var newRefreshToken = _tokenService.CreateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await _db.SaveChangesAsync();

            var jwtToken = _tokenService.CreateAccessToken(user);

            return new TokensResponse(jwtToken, newRefreshToken);
        }

        public async Task<JwtResponse> RegisterAsync(RegisterUserRequest request)
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
            
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = _tokenService.CreateAccessToken(user);

            return new JwtResponse(token);
        }
    }
}
