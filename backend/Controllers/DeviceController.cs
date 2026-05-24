using backend.DTOs.Devices.Requests;
using backend.DTOs.Devices.Responses;
using backend.DTOs.UserGroups.Requests;
using backend.DTOs.Users.Requests;
using backend.Exceptions;
using backend.Extension;
using backend.Interfaces;
using backend.Models;
using backend.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DeviceController(IDeviceService _deviceService) : ControllerBase
    {
        [HttpGet("{deviceId:guid}")]
        public async Task<ActionResult<DeviceDetailsResponse>> GetSingle(Guid deviceId)
        {
            await EnsureAccessAsync(DeviceAccessLevel.ReadOnly, deviceId: deviceId);

            var device = await _deviceService.GetSingleAsync(deviceId);
            return Ok(device);
        }

        [HttpGet("workspace/{workspaceId}")]
        public async Task<ActionResult<IEnumerable<DeviceResponse>>> GetAll(Guid workspaceId)
        {
            await EnsureAccessAsync(DeviceAccessLevel.ReadOnly, workspaceId: workspaceId);

            var device = await _deviceService.GetAllAsync(workspaceId);
            return Ok(device);
        }

        [HttpPut("{deviceId:guid}")]
        public async Task<ActionResult<DeviceResponse>> Update(Guid deviceId, UpdateDeviceRequest request)
        {
            await EnsureAccessAsync(DeviceAccessLevel.FullAccess, deviceId: deviceId);

            var updatedDevice = await _deviceService.UpdateAsync(deviceId, request);
            return Ok(updatedDevice);
        }

        [HttpPost("{deviceId:guid}/assign")]
        public async Task<IActionResult> AssignDevice(Guid deviceId, AssignDeviceRequest request)
        {
            await EnsureAccessAsync(DeviceAccessLevel.FullAccess, workspaceId: request.WorkspaceId);

            await _deviceService.AssingAsync(deviceId, request.WorkspaceId);
            return Ok();
        }

        [HttpPost("{deviceId:guid}/remove")]
        public async Task<IActionResult> RemoveDevice(Guid deviceId)
        {
            await EnsureAccessAsync(DeviceAccessLevel.FullAccess, deviceId: deviceId);

            await _deviceService.RemoveAsync(deviceId);
            return Ok();
        }

        [HttpPost("{deviceId:guid}/user-access")]
        public async Task<IActionResult> AddUserAccess(Guid deviceId, UserIdRequest request)
        {
            await EnsureAccessAsync(DeviceAccessLevel.FullAccess, deviceId: deviceId);

            await _deviceService.AddUserAccessAsync(deviceId, request.UserId);
            return Ok();
        }

        [HttpDelete("{deviceId:guid}/user-access")]
        public async Task<IActionResult> RemoveUserAccess(Guid deviceId, UserIdRequest request)
        {
            await EnsureAccessAsync(DeviceAccessLevel.FullAccess, deviceId: deviceId);

            await _deviceService.RemoveUserAccessAsync(deviceId, request.UserId);
            return Ok();
        }

        [HttpPost("{deviceId:guid}/group-access")]
        public async Task<IActionResult> AddGroupAccess(Guid deviceId, UserGroupIdRequest request)
        {
            await EnsureAccessAsync(DeviceAccessLevel.FullAccess, deviceId: deviceId);

            await _deviceService.AddGroupAccessAsync(deviceId, request.UserGroupId);
            return Ok();
        }

        [HttpDelete("{deviceId:guid}/group-access")]
        public async Task<IActionResult> RemoveGroupAccess(Guid deviceId, UserGroupIdRequest request)
        {
            await EnsureAccessAsync(DeviceAccessLevel.FullAccess, deviceId: deviceId);

            await _deviceService.RemoveGroupAccessAsync(deviceId, request.UserGroupId);
            return Ok();
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetAccessibleDevices()
        {
            await _deviceService.GetAccessibleDevicesAsync(User.GetUserId());
            return Ok();
        }

        [HttpPost("{deviceId:guid}/open/{time:int}")]
        public async Task<IActionResult> ActivateDevice(Guid deviceId, int time)
        {
            return Ok();
        }

        private async Task EnsureAccessAsync(DeviceAccessLevel requiredLevel, Guid? deviceId = null, Guid? workspaceId = null)
        {
            var access = await _deviceService.CheckAccessAsync(User.GetUserId(), workspaceId, deviceId);

            if (User.IsAdmin()) return;

            if (access < requiredLevel)
            {
                throw new ForbiddenException();
            }
        }
    }
}
