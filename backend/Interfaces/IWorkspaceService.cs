using backend.DTOs.Users.Requests;
using backend.DTOs.Workspaces.Requests;
using backend.DTOs.Workspaces.Responses;
using backend.Models.Enums;

namespace backend.Interfaces
{
    public interface IWorkspaceService
    {
        Task<WorkspaceResponse> CreateAsync(CreateWorkspaceRequest request);
        Task<IEnumerable<WorkspaceResponse>> GetAllAsync();
        Task<IEnumerable<WorkspaceResponse>> GetUserWorkspacesAsync(Guid userId);
        Task<WorkspaceDetailsResponse> GetSingleAsync(Guid workspaceId);
        Task<WorkspaceResponse> UpdateAsync(Guid workspaceId, UpdateWorkspaceRequest request);
        Task DeleteAsync(Guid workspaceId);
        Task<IEnumerable<UserResponse>> GetWorkspaceMembersAsync(Guid workspaceId);
        Task JoinAsync(Guid userId, string workspaceCode);
        Task AddToWorkspaceAsync(Guid workspaceId, AddToWorkspaceRequest request);
        Task RemoveFromWorkspaceAsync(Guid workspaceId, RemoveFromWorkspaceRequest request);
        Task UpdateWorkspaceRoleAsync(Guid workspaceId, UpdateWorkspaceMemberRequest request);
        Task<AccessLevel> CheckWorkspaceAccessAsync(Guid userId, Guid workspaceId);
    }
}
