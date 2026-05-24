using backend.DTOs.Users.Requests;
using backend.DTOs.Users.Responses;
using backend.Exceptions;
using backend.Extension;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService _authService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<JwtResponse>> Register(RegisterUserRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<JwtResponse>> Login(LoginUserRequest request)
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
        public async Task<ActionResult<JwtResponse>> Refresh()
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

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync(User.GetUserId());
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict
            });
            return Ok();
        }

        [Authorize]
        [HttpPost("me")]
        public async Task<ActionResult<UserDetailsResponse>> Me()
        {
            var user = await _authService.UserDetailsAsync(User.GetUserId());
            return Ok(user);
        }
    }
}
