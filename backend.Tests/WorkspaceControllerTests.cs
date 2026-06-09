using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.DTOs.Users.Requests;
using backend.DTOs.Users.Responses;
using backend.DTOs.Workspaces.Requests;
using backend.DTOs.Workspaces.Responses;
using backend.Models.Enums;

namespace backend.Tests;

public class WorkspaceControllerTests : BaseIntegrationTest
{
  public WorkspaceControllerTests(CustomWebApplicationFactory factory) : base(factory) { }

  private async Task<Guid> CreateWorkspaceAsAdminAsync()
  {
    var token = await GetAuthTokenAsync();
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    var createRequest = new CreateWorkspaceRequest { Name = $"Test Workspace {Guid.NewGuid()}" };
    var response = await Client.PostAsJsonAsync("/api/workspace", createRequest);

    var workspace = await response.Content.ReadFromJsonAsync<WorkspaceResponse>();
    return workspace!.Id;
  }

  [Fact]
  public async Task CreateWorkspace_WithValidData_ReturnsCreatedAndCreatesWorkspace()
  {
    // ARRANGE
    var token = await GetAuthTokenAsync();
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    var request = new CreateWorkspaceRequest { Name = "Mój pierwszy Workspace" };

    // ACT
    var response = await Client.PostAsJsonAsync("/api/workspace", request);

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
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    var createRequest = new CreateWorkspaceRequest { Name = "Sekretny projekt" };

    await Client.PostAsJsonAsync("/api/workspace", createRequest);

    // ACT
    var response = await Client.GetAsync("/api/workspace");

    // ASSERT
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);

    var workspaces = await response.Content.ReadFromJsonAsync<List<WorkspaceResponse>>();

    Assert.NotNull(workspaces);
    Assert.NotEmpty(workspaces);
    Assert.Contains(workspaces, w => w.Name == "Sekretny projekt");
  }

  [Fact]
  public async Task GetWorkspaces_WithoutToken_ReturnsUnauthorized()
  {
    var unauthenticatedClient = Factory.CreateClient();

    // ACT
    var response = await unauthenticatedClient.GetAsync("/api/workspace");

    // ASSERT
    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
  }

  [Fact]
  public async Task CreateWorkspace_AsNormalUser_ReturnsForbidden()
  {
    // ARRANGE:
    await GetAuthTokenAsync();

    var normalUserEmail = $"normal_{Guid.NewGuid()}@dotpass.com";
    var password = "StrongPassword123!";

    await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
    {
      Email = normalUserEmail,
      Password = password,
      Firstname = "Zwykły",
      Lastname = "User"
    });

    var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest
    {
      Email = normalUserEmail,
      Password = password
    });

    var normalUserToken = (await loginResponse.Content.ReadFromJsonAsync<JwtResponse>())!.Token;

    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", normalUserToken);

    var request = new CreateWorkspaceRequest { Name = "Hakowanie systemu" };

    // ACT:
    var response = await Client.PostAsJsonAsync("/api/workspace", request);

    // ASSERT
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  // [Fact]
  // public async Task GetSingleWorkspace_WithValidId_ReturnsWorkspaceDetails()
  // {
  //   // ARRANGE
  //   var token = await GetAuthTokenAsync();
  //   Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

  //   var workspaceId = await CreateWorkspaceAsAdminAsync();

  //   // ACT
  //   var response = await Client.GetAsync($"/api/workspace/{workspaceId}");

  //   // ASSERT
  //   Assert.Equal(HttpStatusCode.OK, response.StatusCode);

  //   var workspace = await response.Content.ReadFromJsonAsync<WorkspaceDetailsResponse>();
  //   Assert.NotNull(workspace);
  //   Assert.Equal(workspaceId, workspace.Id);
  //   Assert.NotEmpty(workspace.Code);
  // }

  [Fact]
  public async Task GetSingleWorkspace_WithInvalidId_ReturnsBadRequest()
  {
    // ARRANGE
    var token = await GetAuthTokenAsync();
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    var invalidId = Guid.NewGuid();

    // ACT
    var response = await Client.GetAsync($"/api/workspace/{invalidId}");

    // ASSERT
    Assert.True(response.StatusCode == HttpStatusCode.Forbidden || response.StatusCode == HttpStatusCode.NotFound);
  }

  [Fact]
  public async Task UpdateWorkspace_AsAdmin_ReturnsUpdatedWorkspace()
  {
    // ARRANGE
    var token = await GetAuthTokenAsync();
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    var workspaceId = await CreateWorkspaceAsAdminAsync();
    var updateRequest = new UpdateWorkspaceRequest { Name = "Updated Workspace Name" };

    // ACT
    var response = await Client.PutAsJsonAsync($"/api/workspace/{workspaceId}", updateRequest);

    // ASSERT
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);

    var workspace = await response.Content.ReadFromJsonAsync<WorkspaceResponse>();
    Assert.NotNull(workspace);
    Assert.Equal("Updated Workspace Name", workspace.Name);
  }

  [Fact]
  public async Task UpdateWorkspace_AsNormalUser_ReturnsForbidden()
  {
    // ARRANGE
    var adminToken = await GetAuthTokenAsync();
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

    var workspaceId = await CreateWorkspaceAsAdminAsync();

    // Register and login as normal user
    var normalUserEmail = $"normal_{Guid.NewGuid()}@dotpass.com";
    var password = "StrongPassword123!";

    await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
    {
      Email = normalUserEmail,
      Password = password,
      Firstname = "Zwykły",
      Lastname = "User"
    });

    var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest
    {
      Email = normalUserEmail,
      Password = password
    });

    var normalUserToken = (await loginResponse.Content.ReadFromJsonAsync<JwtResponse>())!.Token;
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", normalUserToken);

    var updateRequest = new UpdateWorkspaceRequest { Name = "Hacked Name" };

    // ACT
    var response = await Client.PutAsJsonAsync($"/api/workspace/{workspaceId}", updateRequest);

    // ASSERT
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task DeleteWorkspace_AsAdmin_ReturnsNoContent()
  {
    // ARRANGE
    var token = await GetAuthTokenAsync();
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    var workspaceId = await CreateWorkspaceAsAdminAsync();

    // ACT
    var response = await Client.DeleteAsync($"/api/workspace/{workspaceId}");

    // ASSERT
    Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
  }

  [Fact]
  public async Task DeleteWorkspace_AsNormalUser_ReturnsForbidden()
  {
    // ARRANGE
    var adminToken = await GetAuthTokenAsync();
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

    var workspaceId = await CreateWorkspaceAsAdminAsync();

    // Register and login as normal user
    var normalUserEmail = $"normal_{Guid.NewGuid()}@dotpass.com";
    var password = "StrongPassword123!";

    await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
    {
      Email = normalUserEmail,
      Password = password,
      Firstname = "Zwykły",
      Lastname = "User"
    });

    var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest
    {
      Email = normalUserEmail,
      Password = password
    });

    var normalUserToken = (await loginResponse.Content.ReadFromJsonAsync<JwtResponse>())!.Token;
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", normalUserToken);

    // ACT
    var response = await Client.DeleteAsync($"/api/workspace/{workspaceId}");

    // ASSERT
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  // [Fact]
  // public async Task JoinWorkspace_WithValidCode_AddsUserToWorkspace()
  // {
  //   // ARRANGE
  //   var adminToken = await GetAuthTokenAsync();
  //   Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

  //   var workspaceId = await CreateWorkspaceAsAdminAsync();

  //   var getResponse = await Client.GetAsync($"/api/workspace/{workspaceId}");
  //   var workspaceDetails = await getResponse.Content.ReadFromJsonAsync<WorkspaceDetailsResponse>();
  //   var joinCode = workspaceDetails!.Code;

  //   // Register and login as normal user
  //   var normalUserEmail = $"normal_{Guid.NewGuid()}@dotpass.com";
  //   var password = "StrongPassword123!";

  //   await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
  //   {
  //     Email = normalUserEmail,
  //     Password = password,
  //     Firstname = "Zwykły",
  //     Lastname = "User"
  //   });

  //   var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest
  //   {
  //     Email = normalUserEmail,
  //     Password = password
  //   });

  //   var normalUserToken = (await loginResponse.Content.ReadFromJsonAsync<JwtResponse>())!.Token;
  //   Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", normalUserToken);

  //   // ACT
  //   var joinResponse = await Client.PostAsync($"/api/workspace/join/{joinCode}", null);

  //   // ASSERT
  //   Assert.Equal(HttpStatusCode.OK, joinResponse.StatusCode);
  // }

  [Fact]
  public async Task GetWorkspaceMembers_WithValidId_ReturnsMembersList()
  {
    // ARRANGE
    var token = await GetAuthTokenAsync();
    Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    var workspaceId = await CreateWorkspaceAsAdminAsync();

    // ACT
    var response = await Client.GetAsync($"/api/workspace/{workspaceId}/members");

    // ASSERT
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);

    var members = await response.Content.ReadFromJsonAsync<List<UserResponse>>();
    Assert.NotNull(members);
    Assert.IsType<List<UserResponse>>(members);
  }

  // [Fact]
  // public async Task AddToWorkspace_WithValidData_AddsUserToWorkspace()
  // {
  //   // ARRANGE
  //   var adminToken = await GetAuthTokenAsync();
  //   Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

  //   var workspaceId = await CreateWorkspaceAsAdminAsync();

  //   // Register a new user
  //   var newUserEmail = $"newuser_{Guid.NewGuid()}@dotpass.com";
  //   var password = "StrongPassword123!";

  //   await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
  //   {
  //     Email = newUserEmail,
  //     Password = password,
  //     Firstname = "New",
  //     Lastname = "User"
  //   });

  //   var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest
  //   {
  //     Email = newUserEmail,
  //     Password = password
  //   });

  //   var newUserResponse = await Client.GetAsync("/api/auth/me");
  //   var newUserData = await newUserResponse.Content.ReadFromJsonAsync<UserResponse>();
  //   var newUserId = newUserData!.Id;

  //   // Switch back to admin token
  //   Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

  //   var addRequest = new AddToWorkspaceRequest
  //   {
  //     UserId = newUserId,
  //     Role = WorkspaceRole.Member
  //   };

  //   // ACT
  //   var response = await Client.PostAsJsonAsync($"/api/workspace/{workspaceId}/members", addRequest);

  //   // ASSERT
  //   Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  // }

  // [Fact]
  // public async Task UpdateWorkspaceRole_WithValidData_UpdatesUserRole()
  // {
  //   // ARRANGE
  //   var adminToken = await GetAuthTokenAsync();
  //   Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

  //   var workspaceId = await CreateWorkspaceAsAdminAsync();

  //   // Register a new user
  //   var newUserEmail = $"newuser_{Guid.NewGuid()}@dotpass.com";
  //   var password = "StrongPassword123!";

  //   await Client.PostAsJsonAsync("/api/auth/register", new RegisterUserRequest
  //   {
  //     Email = newUserEmail,
  //     Password = password,
  //     Firstname = "New",
  //     Lastname = "User"
  //   });

  //   var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new LoginUserRequest
  //   {
  //     Email = newUserEmail,
  //     Password = password
  //   });

  //   var newUserResponse = await Client.GetAsync("/api/auth/me");
  //   var newUserData = await newUserResponse.Content.ReadFromJsonAsync<UserResponse>();
  //   var newUserId = newUserData!.Id;

  //   // Switch back to admin token and add user
  //   Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

  //   var addRequest = new AddToWorkspaceRequest
  //   {
  //     UserId = newUserId,
  //     Role = WorkspaceRole.Member
  //   };

  //   await Client.PostAsJsonAsync($"/api/workspace/{workspaceId}/members", addRequest);

  //   // Update role to Moderator
  //   var updateRequest = new UpdateWorkspaceMemberRequest
  //   {
  //     UserId = newUserId,
  //     Role = WorkspaceRole.Moderator
  //   };

  //   // ACT
  //   var response = await Client.PutAsJsonAsync($"/api/workspace/{workspaceId}/members", updateRequest);

  //   // ASSERT
  //   Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  // }

  // [Fact]
  // public async Task RemoveFromWorkspace_RemovingSelf_ReturnsBadRequest()
  // {
  //   // ARRANGE
  //   var token = await GetAuthTokenAsync();
  //   Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

  //   var workspaceId = await CreateWorkspaceAsAdminAsync();

  //   // Get current user ID
  //   var meResponse = await Client.GetAsync("/api/auth/me");
  //   var userData = await meResponse.Content.ReadFromJsonAsync<UserResponse>();
  //   var userId = userData!.Id;

  //   var removeRequest = new RemoveFromWorkspaceRequest
  //   {
  //     UserId = userId
  //   };

  //   // ACT
  //   var httpRequest = new HttpRequestMessage(HttpMethod.Delete, $"/api/workspace/{workspaceId}/members");
  //   httpRequest.Content = new StringContent(
  //     System.Text.Json.JsonSerializer.Serialize(removeRequest),
  //     System.Text.Encoding.UTF8,
  //     "application/json"
  //   );
  //   var response = await Client.SendAsync(httpRequest);

  //   // ASSERT
  //   Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
  // }
}