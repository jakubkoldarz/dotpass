using System.Net;
using System.Net.Http.Json;
using backend.DTOs.Users.Requests;
using backend.DTOs.Users.Responses;

namespace backend.Tests;

public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkAndSetCookieHeader()
    {
        var uniqueEmail = $"user_{Guid.NewGuid()}@dotpass.com";
        var password = "StrongPassword123!";
        
        var registerRequest = new RegisterUserRequest 
        { 
            Email = uniqueEmail, 
            Password = password, 
            Firstname = "Jan", 
            Lastname = "Kowalski" 
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginUserRequest 
        { 
            Email = uniqueEmail, 
            Password = password 
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var responseBody = await response.Content.ReadFromJsonAsync<JwtResponse>();
        Assert.NotNull(responseBody);
        Assert.False(string.IsNullOrEmpty(responseBody.Token));

        Assert.True(response.Headers.Contains("Set-Cookie"));
        var cookies = response.Headers.GetValues("Set-Cookie");
        Assert.Contains(cookies, c => c.StartsWith("refreshToken="));
    }

    [Fact]
    public async Task Refresh_WithValidRefreshToken_ReturnsNewJwtAndNewCookie()
    {
        var uniqueEmail = $"refresh_{Guid.NewGuid()}@dotpass.com";
        var password = "StrongPassword123!";
        
        await _client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest 
        { 
            Email = uniqueEmail, Password = password, Firstname = "A", Lastname = "B" 
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest 
        { 
            Email = uniqueEmail, Password = password 
        });

        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").First(c => c.StartsWith("refreshToken="));
        var refreshTokenCookie = setCookieHeader.Split(';').First(); 

        var refreshRequestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        refreshRequestMessage.Headers.Add("Cookie", refreshTokenCookie); 
        
        var refreshResponse = await _client.SendAsync(refreshRequestMessage);

        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);

        var refreshResponseBody = await refreshResponse.Content.ReadFromJsonAsync<JwtResponse>();
        Assert.NotNull(refreshResponseBody);
        Assert.False(string.IsNullOrEmpty(refreshResponseBody.Token));

        var newCookies = refreshResponse.Headers.GetValues("Set-Cookie");
        Assert.Contains(newCookies, c => c.StartsWith("refreshToken="));
    }
}