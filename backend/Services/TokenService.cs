using backend.DTOs.Users.Requests;
using backend.Exceptions;
using backend.Interfaces;
using backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Services
{
    public class TokenService(IConfiguration config) : ITokenService
    {
        public string CreateAccessToken(User user)
        {
            if (user == null) throw new BadRequestException("User data is incomplete");

            var jwtKey = config["JWT_SECRET"] ?? config["Jwt:Secret"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));

            var issuer = config["Jwt:Issuer"];
            var audience = config["Jwt:Audience"];

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new("IsAdmin", user.IsAdmin.ToString().ToLower()),
                new(JwtRegisteredClaimNames.Iss, issuer!),
                new(JwtRegisteredClaimNames.Aud, audience!),
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(10),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string CreateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
