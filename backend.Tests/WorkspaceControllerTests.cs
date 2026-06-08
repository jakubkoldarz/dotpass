using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.DTOs.Users.Requests;
using backend.DTOs.Users.Responses;
using backend.DTOs.Workspaces.Requests;
using backend.DTOs.Workspaces.Responses;

namespace backend.Tests;

public class WorkspaceControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    
    private static string? _cachedToken; 

    public WorkspaceControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> GetAuthTokenAsync()
    {
        if (_cachedToken != null) return _cachedToken;

        var email = $"admin_{Guid.NewGuid()}@dotpass.com";
        var password = "StrongPassword123!";
        
        await _client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest 
        { 
            Email = email, Password = password, Firstname = "Admin", Lastname = "Test" 
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest 
        { 
            Email = email, Password = password 
        });

        var jwtData = await loginResponse.Content.ReadFromJsonAsync<JwtResponse>();
        _cachedToken = jwtData!.Token;
        
        return _cachedToken;
    }

    [Fact]
    public async Task CreateWorkspace_WithValidData_ReturnsCreatedAndCreatesWorkspace()
    {
        // ARRANGE
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateWorkspaceRequest { Name = "Mój pierwszy Workspace" };

        // ACT
        var response = await _client.PostAsJsonAsync("/api/workspace", request);

        // ASSERT
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var workspace = await response.Content.ReadFromJsonAsync<WorkspaceResponse>();
        Assert.NotNull(workspace);
        Assert.Equal("Mój pierwszy Workspace", workspace.Name);
        Assert.NotEqual(Guid.Empty, workspace.Id);
    }

    [Fact]
    public async Task GetWorkspaces_ReturnsListOfUserWorkspaces()
    {
        // ARRANGE
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createRequest = new CreateWorkspaceRequest { Name = "Sekretny projekt" };
        
        await _client.PostAsJsonAsync("/api/workspace", createRequest);

        // ACT
        var response = await _client.GetAsync("/api/workspace");

        // ASSERT
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var workspaces = await response.Content.ReadFromJsonAsync<List<WorkspaceResponse>>();
        
        Assert.NotNull(workspaces);
        Assert.NotEmpty(workspaces); 
        Assert.Contains(workspaces, w => w.Name == "Sekretny projekt");
    }
}