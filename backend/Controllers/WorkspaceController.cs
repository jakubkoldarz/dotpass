using backend.DTOs.Users.Requests;
using backend.DTOs.Workspaces.Requests;
using backend.DTOs.Workspaces.Responses;
using backend.Exceptions;
using backend.Extension;
using backend.Interfaces;
using backend.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WorkspaceController(IWorkspaceService _workspaceService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkspaceResponse>>> GetAll()
        {
            if(!User.IsAdmin()) throw new ForbiddenException();
            var workspaces = await _workspaceService.GetAllAsync();
            return Ok(workspaces);
        }

        [HttpGet("{workspaceId:guid}")]
        public async Task<ActionResult<WorkspaceDetailsResponse>> GetSingle(Guid workspaceId)
        {
            var access = await _workspaceService.CheckWorkspaceAccessAsync(User.GetUserId(), workspaceId);
            if (access <= AccessLevel.ReadOnly) throw new ForbiddenException();

            var workspace = await _workspaceService.GetSingleAsync(workspaceId);
            return Ok(workspace);
        }

        [HttpPost]
        public async Task<ActionResult<WorkspaceResponse>> Create(CreateWorkspaceRequest request)
        {
            if (!User.IsAdmin()) throw new ForbiddenException();
            var workspace = await _workspaceService.CreateAsync(request);
            return Created($"/api/workspace/{workspace.Id}", workspace);
        }

        [HttpDelete("{workspaceId:guid}")]
        public async Task<ActionResult> Delete(Guid workspaceId)
        {
            if (!User.IsAdmin()) throw new ForbiddenException();
            await _workspaceService.DeleteAsync(workspaceId);
            return NoContent();
        }

        [HttpPut("{workspaceId:guid}")]
        public async Task<ActionResult<WorkspaceResponse>> Update(Guid workspaceId, UpdateWorkspaceRequest request)
        {
            if (!User.IsAdmin()) throw new ForbiddenException();
            var workspace = await _workspaceService.UpdateAsync(workspaceId, request);
            return Ok(workspace);
        }

        [HttpGet("{workspaceId:guid}/members")]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetMembers(Guid workspaceId)
        {
            var access = await _workspaceService.CheckWorkspaceAccessAsync(User.GetUserId(), workspaceId);
            if (access <= AccessLevel.None) throw new ForbiddenException();

            var members = await _workspaceService.GetWorkspaceMembersAsync(workspaceId);
            return Ok(members);
        }

        [HttpPost("{workspaceId:guid}/members")]
        public async Task<IActionResult> AddToWorkspace(Guid workspaceId, AddToWorkspaceRequest request)
        {
            var access = await _workspaceService.CheckWorkspaceAccessAsync(User.GetUserId(), workspaceId);
            if (access <= AccessLevel.ReadOnly) throw new ForbiddenException();

            await _workspaceService.AddToWorkspaceAsync(workspaceId, request);
            return Ok();
        }

        [HttpPut("{workspaceId:guid}/members")]
        public async Task<IActionResult> UpdateWorkspaceRole(Guid workspaceId, UpdateWorkspaceMemberRequest request)
        {
            var access = await _workspaceService.CheckWorkspaceAccessAsync(User.GetUserId(), workspaceId);
            if (access <= AccessLevel.ReadOnly) throw new ForbiddenException();

            await _workspaceService.UpdateWorkspaceRoleAsync(workspaceId, request);
            return Ok();
        }

        [HttpDelete("{workspaceId:guid}/members")]
        public async Task<IActionResult> RemoveFromWorkspace(Guid workspaceId, RemoveFromWorkspaceRequest request)
        {
            var access = await _workspaceService.CheckWorkspaceAccessAsync(User.GetUserId(), workspaceId);
            if (access <= AccessLevel.ReadOnly) throw new ForbiddenException();

            if(User.GetUserId() == request.UserId) throw new BadRequestException("You cannot remove yourself from workspace");

            await _workspaceService.RemoveFromWorkspaceAsync(workspaceId, request);
            return Ok();
        }
    }
}
