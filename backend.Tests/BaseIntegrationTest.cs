using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using backend.DTOs.Users.Requests;
using backend.DTOs.Users.Responses;
using backend.DTOs.Workspaces.Responses;
using Xunit;

namespace backend.Tests;

public abstract class BaseIntegrationTest : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly HttpClient Client;
    protected readonly CustomWebApplicationFactory Factory;
    private static string? _cachedToken;

    protected BaseIntegrationTest(CustomWebApplicationFactory factory)
    {
        Client = factory.CreateClient();
        Factory = factory;
    }

    protected async Task<string> GetAuthTokenAsync()
    {
        if (_cachedToken != null) return _cachedToken;

        var email = $"admin_{Guid.NewGuid()}@dotpass.com";
        var password = "StrongPassword123!";

        await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
        {
            Email = email,
            Password = password,
            Firstname = "Admin",
            Lastname = "Test"
        });

        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest
        {
            Email = email,
            Password = password
        });

        var jwtData = await loginResponse.Content.ReadFromJsonAsync<JwtResponse>();
        _cachedToken = jwtData!.Token;

        return _cachedToken;
    }

    protected async Task<HttpResponseMessage> PostWithAuthAsync(string url, object content, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Content = JsonContent.Create(content);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await Client.SendAsync(request);
    }

    protected async Task<HttpResponseMessage> GetWithAuthAsync(string url, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await Client.SendAsync(request);
    }

    protected async Task<HttpResponseMessage> PutWithAuthAsync(string url, object content, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Put, url);
        request.Content = JsonContent.Create(content);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await Client.SendAsync(request);
    }

    protected async Task<HttpResponseMessage> DeleteWithAuthAsync(string url, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Delete, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await Client.SendAsync(request);
    }

    protected async Task<HttpResponseMessage> PostWithoutAuthAsync(string url, object content)
    {
        return await Client.PostAsJsonAsync(url, content);
    }
}