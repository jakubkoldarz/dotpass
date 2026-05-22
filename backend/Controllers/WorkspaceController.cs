using backend.DTOs.Workspaces.Requests;
using backend.DTOs.Workspaces.Responses;
using backend.Exceptions;
using backend.Extension;
using backend.Interfaces;
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

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<WorkspaceResponse>> GetSingle([FromRoute(Name = "id")] Guid workspaceId)
        {
            if (!User.IsAdmin()) throw new ForbiddenException();
            var workspace = await _workspaceService.GetSingleAsync(workspaceId);
            return Ok(workspace);
        }

        [HttpPost]
        public async Task<ActionResult<WorkspaceResponse>> Create(CreateWorkspaceRequest request)
        {
            if (!User.IsAdmin()) throw new ForbiddenException();
            var workspace = await _workspaceService.CreateAsync(request);
            return Ok(workspace);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> Delete([FromRoute(Name = "id")] Guid workspaceId)
        {
            if (!User.IsAdmin()) throw new ForbiddenException();
            await _workspaceService.DeleteAsync(workspaceId);
            return NoContent();
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<WorkspaceResponse>> Update([FromRoute(Name = "id")] Guid workspaceId, UpdateWorkspaceRequest request)
        {
            if (!User.IsAdmin()) throw new ForbiddenException();
            var workspace = await _workspaceService.UpdateAsync(workspaceId, request);
            return Ok(workspace);
        }
    }
}
