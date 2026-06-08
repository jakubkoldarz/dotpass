using backend.DTOs.UserGroups.Requests;
using backend.DTOs.UserGroups.Responses;
using backend.DTOs.Users.Requests;
using backend.Exceptions;
using backend.Extension;
using backend.Models.Enums;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserGroupController(IUserGroupService _userGroupService) : ControllerBase
    {
        [HttpGet("{userGroupId:guid}")]
        public async Task<ActionResult<UserGroupDetailsResponse>> GetSingle(Guid userGroupId)
        {
            var access = await _userGroupService.CheckGroupAccessAsync(User, userGroupId);
            if (access <= AccessLevel.None) throw new ForbiddenException();

            var group = await _userGroupService.GetSingleAsync(userGroupId);
            return Ok(group);
        }

        [HttpGet("workspace/{workspaceId:guid}")]
        public async Task<ActionResult<IEnumerable<UserGroupResponse>>> GetAll(Guid workspaceId)
        {
            var access = await _userGroupService.CheckGroupAccessAsync(user: User, workspaceId: workspaceId);
            if (access <= AccessLevel.None) throw new ForbiddenException();

            var group = await _userGroupService.GetAllAsync(workspaceId);
            return Ok(group);
        }

        [HttpPost("workspace/{workspaceId:guid}")]
        public async Task<ActionResult<UserGroupResponse>> Create(Guid workspaceId, CreateUserGroupRequest request)
        {
            var access = await _userGroupService.CheckGroupAccessAsync(user: User, workspaceId: workspaceId);
            if (access <= AccessLevel.ReadOnly) throw new ForbiddenException();

            var group = await _userGroupService.CreateAsync(workspaceId, request);
            return Created($"/api/usergroup/{group.Id}", group);
        }

        [HttpPut("{userGroupId:guid}")]
        public async Task<ActionResult<UserGroupResponse>> Update(Guid userGroupId, UpdateUserGroupRequest request)
        {
            var access = await _userGroupService.CheckGroupAccessAsync(User, userGroupId);
            if (access <= AccessLevel.ReadOnly) throw new ForbiddenException();

            var group = await _userGroupService.UpdateAsync(userGroupId, request);
            return Ok(group);
        }

        [HttpDelete("{userGroupId:guid}")]
        public async Task<ActionResult> Delete(Guid userGroupId)
        {
            var access = await _userGroupService.CheckGroupAccessAsync(User, userGroupId);
            if (access <= AccessLevel.ReadOnly) throw new ForbiddenException();

            await _userGroupService.DeleteAsync(userGroupId);
            return NoContent();
        }

        [HttpPost("{userGroupId:guid}/members")]
        public async Task<ActionResult> AddToGroup(Guid userGroupId, UserIdRequest request)
        {
            var access = await _userGroupService.CheckGroupAccessAsync(User, userGroupId);
            if (access <= AccessLevel.ReadOnly) throw new ForbiddenException();

            await _userGroupService.AddToGroupAsync(request.UserId, userGroupId);
            return NoContent();
        }

        [HttpDelete("{userGroupId:guid}/members")]
        public async Task<ActionResult> RemoveFromGroup(Guid userGroupId, UserIdRequest request)
        {
            var access = await _userGroupService.CheckGroupAccessAsync(User, userGroupId);
            if (access <= AccessLevel.ReadOnly) throw new ForbiddenException();

            await _userGroupService.RemoveFromGroupAsync(request.UserId, userGroupId);
            return NoContent();
        }
    }
}
