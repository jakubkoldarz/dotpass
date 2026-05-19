using backend.DTOs.Users.Requests;
using backend.Exceptions;
using backend.Extension;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService _authService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterUserRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginUserRequest request)
        {
            var tokens = await _authService.LoginAsync(request);

            Response.Cookies.Append("refreshToken", tokens.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new JwtResponse(tokens.JwtToken));
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if(string.IsNullOrEmpty(refreshToken))
            {
                throw new UnauthorizedException("No refresh token provided");
            }

            var tokens = await _authService.RefreshAsync(refreshToken);

            Response.Cookies.Append("refreshToken", tokens.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new JwtResponse(tokens.JwtToken));
        }

    }
}
