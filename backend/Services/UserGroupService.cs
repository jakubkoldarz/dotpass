using backend.Data;
using backend.DTOs.Devices.Responses;
using backend.DTOs.UserGroups.Requests;
using backend.DTOs.UserGroups.Responses;
using backend.DTOs.Users.Requests;
using backend.DTOs.Workspaces.Responses;
using backend.Exceptions;
using backend.Extension;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Services
{
    public class UserGroupService(ApplicationDbContext _db) : IUserGroupService
    {
        public async Task<IEnumerable<UserGroupResponse>> GetAllAsync(Guid workspaceId)
        {
            var groups = await _db.UserGroups
                .Where(g => g.WorkspaceId == workspaceId)
                .Select(g => new UserGroupResponse
                {
                    Id = g.Id,
                    Name = g.Name,
                }).ToListAsync(); 

            return groups;
        }

        public async Task<UserGroupDetailsResponse> GetSingleAsync(Guid userGroupId)
        {
            var group = await _db.UserGroups
                .Where(g => g.Id == userGroupId)
                .Select(g => new UserGroupDetailsResponse
                {
                    Id = g.Id,
                    Name = g.Name,

                    Workspace = new WorkspaceResponse
                    {
                        Id = g.Workspace!.Id,
                        Name = g.Workspace.Name
                    },

                    Members = g.GroupMembers.Select(gm => new UserResponse
                    {
                        Id = gm.User!.Id,
                        Email = gm.User.Email,
                        Firstname = gm.User.Firstname,
                        Lastname = gm.User.Lastname
                    }),

                    DeviceAccesses = g.DeviceAccesses.Select(da => new BasicDeviceResponse
                    {
                        Id = da.Device!.Id,
                        Name = da.Device.Name!,
                        IsPublicInWorkspace = da.Device.IsPublicInWorkspace ?? false
                    })

                }).FirstOrDefaultAsync();

            if (group == null) throw new NotFoundException();

            return group;
        }

        public async Task<AccessLevel> CheckGroupAccessAsync(ClaimsPrincipal user, Guid? userGroupId = null, Guid? workspaceId = null)
        {
            var userId = user.GetUserId();

            if (user.IsAdmin()) return AccessLevel.FullAccess;

            if (userGroupId == null && workspaceId != null)
            {
                var workspaceRole = await _db.WorkspaceMembers
                    .Where(w => w.WorkspaceId == workspaceId && w.UserId == userId)
                    .Select(w => w.Role)
                    .FirstOrDefaultAsync();

                if (workspaceRole == WorkspaceRole.Moderator)
                    return AccessLevel.FullAccess;

                return AccessLevel.None;
            }

            if (userGroupId != null)
            {
                var accessData = await _db.UserGroups
                    .Where(g => g.Id == userGroupId)
                    .Select(g => new
                    {
                        IsGroupMember = g.GroupMembers.Any(gm => gm.UserId == userId),
                        WorkspaceRole = _db.WorkspaceMembers
                            .Where(wm => wm.WorkspaceId == g.WorkspaceId && wm.UserId == userId)
                            .Select(wm => wm.Role)
                            .FirstOrDefault(),
                    })
                    .FirstOrDefaultAsync();

                if (accessData == null) return AccessLevel.None; 

                if (accessData.WorkspaceRole == WorkspaceRole.Moderator)
                    return AccessLevel.FullAccess;

                if (accessData.IsGroupMember)
                    return AccessLevel.ReadOnly;
            }

            return AccessLevel.None;
        }

        public async Task<UserGroupResponse> CreateAsync(Guid workspaceId, CreateUserGroupRequest request)
        {
            var groupToAdd = new UserGroup
            {
                Name = request.Name,
                WorkspaceId = workspaceId
            };

            _db.UserGroups.Add(groupToAdd);
            await _db.SaveChangesAsync();

            return new UserGroupResponse { Id = groupToAdd.Id, Name = groupToAdd.Name, WorkspaceId = groupToAdd.WorkspaceId };
        }

        public async Task<UserGroupResponse> UpdateAsync(Guid userGroupId, UpdateUserGroupRequest request)
        {
            var groupToUpdate = await _db.UserGroups.FindAsync(userGroupId);
            if (groupToUpdate == null) throw new NotFoundException();

            groupToUpdate.Name = request.Name;
            await _db.SaveChangesAsync();

            return new UserGroupResponse
            {
                Id = groupToUpdate.Id,
                Name = groupToUpdate.Name,
                WorkspaceId = groupToUpdate.WorkspaceId
            };
        }

        public async Task DeleteAsync(Guid userGroupId)
        {
            var groupToDelete = await _db.UserGroups.FindAsync(userGroupId);
            if (groupToDelete == null) throw new NotFoundException();

            _db.UserGroups.Remove(groupToDelete);
            await _db.SaveChangesAsync();
        }

        public async Task AddToGroupAsync(Guid userToAddId, Guid userGroupId)
        {
            var groupMembership = new GroupMember
            {
                UserGroupId = userGroupId,
                UserId = userToAddId
            };

            _db.GroupMembers.Add(groupMembership);
            await _db.SaveChangesAsync();
        }

        public async Task RemoveFromGroupAsync(Guid userToRemoveId, Guid userGroupId)
        {
            var groupToDelete = await _db.GroupMembers.FirstOrDefaultAsync(gm => gm.UserId == userToRemoveId && gm.UserGroupId == userGroupId);
            if(groupToDelete == null) throw new NotFoundException();

            _db.GroupMembers.Remove(groupToDelete);
            await _db.SaveChangesAsync();
        }
    }
}
