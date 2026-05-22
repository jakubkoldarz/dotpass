using backend.DTOs.UserGroups.Requests;
using backend.DTOs.UserGroups.Responses;
using backend.Models.Enums;
using System.Security.Claims;

namespace backend.Services
{
    public interface IUserGroupService
    {
        Task<IEnumerable<UserGroupResponse>> GetAllAsync(Guid workspaceId);
        Task<UserGroupDetailsResponse> GetSingleAsync(Guid userGroupId);
        Task<UserGroupResponse> CreateAsync(Guid workspaceId,CreateUserGroupRequest request);
        Task<UserGroupResponse> UpdateAsync(Guid userGroupId, UpdateUserGroupRequest request);
        Task DeleteAsync(Guid userGroupId);
        Task AddToGroupAsync(Guid userToAddId, Guid userGroupId);
        Task RemoveFromGroupAsync(Guid userToRemoveId, Guid userGroupId);
        Task<GroupAccessLevel> CheckGroupAccessAsync(ClaimsPrincipal user, Guid? userGroupId = null, Guid? workspaceId = null);
    }
}
