using backend.DTOs.Workspaces.Requests;
using backend.DTOs.Workspaces.Responses;

namespace backend.Interfaces
{
    public interface IWorkspaceService
    {
        Task<WorkspaceResponse> CreateAsync(CreateWorkspaceRequest request);
        Task<IEnumerable<WorkspaceResponse>> GetAllAsync();
        Task<WorkspaceResponse> GetSingleAsync(Guid workspaceId);
        Task<WorkspaceResponse> UpdateAsync(Guid workspaceId, UpdateWorkspaceRequest request);
        Task DeleteAsync(Guid workspaceId);
    }
}
