using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.DTOs.Users.Requests;
using backend.DTOs.Users.Responses;

namespace backend.Tests;

public class AuthControllerTests : BaseIntegrationTest
{

    public AuthControllerTests(CustomWebApplicationFactory factory) : base(factory) { }

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
        await Client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginUserRequest
        {
            Email = uniqueEmail,
            Password = password
        };

        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

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

        await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
        {
            Email = uniqueEmail,
            Password = password,
            Firstname = "A",
            Lastname = "B"
        });

        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest
        {
            Email = uniqueEmail,
            Password = password
        });

        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").First(c => c.StartsWith("refreshToken="));
        var refreshTokenCookie = setCookieHeader.Split(';').First();

        var refreshRequestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        refreshRequestMessage.Headers.Add("Cookie", refreshTokenCookie);

        var refreshResponse = await Client.SendAsync(refreshRequestMessage);

        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);

        var refreshResponseBody = await refreshResponse.Content.ReadFromJsonAsync<JwtResponse>();
        Assert.NotNull(refreshResponseBody);
        Assert.False(string.IsNullOrEmpty(refreshResponseBody.Token));

        var newCookies = refreshResponse.Headers.GetValues("Set-Cookie");
        Assert.Contains(newCookies, c => c.StartsWith("refreshToken="));
    }

    [Fact]
    public async Task Logout_ClearsRefreshTokenCookie()
    {
        // ARRANGE:
        var uniqueEmail = $"admin_{Guid.NewGuid()}@dotpass.com";
        var password = "StrongPassword123!";

        await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
        {
            Email = uniqueEmail,
            Password = password,
            Firstname = "Admin",
            Lastname = "User"
        });

        var loginRequest = new LoginUserRequest { Email = uniqueEmail, Password = password };
        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        var responseBody = await loginResponse.Content.ReadFromJsonAsync<JwtResponse>();
        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();

        var logoutRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        logoutRequest.Headers.Add("Cookie", setCookieHeader);
        logoutRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", responseBody?.Token);

        // ACT: 
        var response = await Client.SendAsync(logoutRequest);

        // ASSERT
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var setCookie = response.Headers.GetValues("Set-Cookie").FirstOrDefault();
        Assert.NotNull(setCookie);
        Assert.Contains("expires=", setCookie);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // ARRANGE: 
        var email = $"fail_{Guid.NewGuid()}@dotpass.com";
        await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
        { Email = email, Password = "Password123!", Firstname = "X", Lastname = "Y" });

        // ACT: 
        var response = await Client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest
        { Email = email, Password = "WRONGPASSWORD" });

        // ASSERT
        Assert.True(response.StatusCode == HttpStatusCode.Unauthorized || response.StatusCode == HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Refresh_WithInvalidToken_ReturnsUnauthorized()
    {
        // ARRANGE: 
        var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");

        // ACT
        var response = await Client.SendAsync(refreshRequest);

        // ASSERT
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}