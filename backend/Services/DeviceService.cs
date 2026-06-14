using backend.Data;
using backend.DTOs.Devices.Requests;
using backend.DTOs.Devices.Responses;
using backend.DTOs.UserGroups.Responses;
using backend.DTOs.Users.Requests;
using backend.DTOs.Workspaces.Responses;
using backend.Exceptions;
using backend.Interfaces;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace backend.Services
{
    public class DeviceService(ApplicationDbContext _db, IEmqxService _emqxService) : IDeviceService
    {
        public async Task ActivateAsync(Guid userId, Guid deviceId, int time)
        {
            var deviceInfo = await _db.Devices
                .Where(d => d.Id == deviceId)
                .Select(d => new
                {
                    MacAdress = d.MacAddress,
                    IsPublicInWorkspace = (d.IsPublicInWorkspace ?? false)  && d.Workspace!.WorkspaceMembers.Any(wm => wm.UserId == userId),
                    HasDirectAccess = d.UserAccesses.Any(ua => ua.UserId == userId),
                    HasGroupAccess = d.GroupAccesses.Any(ga => ga.UserGroup!.GroupMembers.Any(gm => gm.UserId == userId))
                }).FirstOrDefaultAsync();

            if (deviceInfo == null) throw new NotFoundException();

            var isAdmin = await _db.Users.Where(u => u.Id == userId).Select(u => u.IsAdmin).FirstOrDefaultAsync();
            var hasAccess = isAdmin || deviceInfo.HasGroupAccess || deviceInfo.HasDirectAccess || deviceInfo.IsPublicInWorkspace;

            if (!hasAccess) throw new ForbiddenException();

            string topic = $"devices/{deviceInfo.MacAdress}/cmd";
            string payload = $"open {time}";

            await _emqxService.PublishMessageAsync(topic, payload);
        }

        public async Task AddGroupAccessAsync(Guid userGroupId, Guid deviceId)
        {
            var group = await _db.UserGroups.FindAsync(userGroupId);
            var device = await _db.Devices.FindAsync(deviceId);

            if (group == null || device == null) throw new BadRequestException("Group or device does not exist");

            if (group.WorkspaceId != device.WorkspaceId)
                throw new BadRequestException("Group and device are not in the same workspace");

            var accessExist = await _db.DeviceGroupAccesses
                .AnyAsync(dga => dga.DeviceId == deviceId && dga.UserGroupId == userGroupId);
            if (accessExist) throw new BadRequestException("Group already has access to this device");

            var groupAccess = new DeviceGroupAccess
            {
                DeviceId = deviceId,
                UserGroupId = userGroupId,
            };

            _db.DeviceGroupAccesses.Add(groupAccess);
            await _db.SaveChangesAsync();
        }

        public async Task AddUserAccessAsync(Guid userId, Guid deviceId)
        {
            var user = await _db.Users.FindAsync(userId);
            var device = await _db.Devices.FindAsync(deviceId);

            if (user == null) throw new BadRequestException($"User does not exist {userId}");
            if (device == null) throw new BadRequestException($"Device does not exist {deviceId}");

            //if (!user.WorkspaceMemberships.Any(wm => wm.WorkspaceId == device.WorkspaceId))
            //    throw new BadRequestException("User and device are not in the same workspace");

            var accessExist = await _db.DeviceUserAccesses
                .AnyAsync(dua => dua.UserId == userId && dua.DeviceId == deviceId);
            if (accessExist) throw new BadRequestException("User already has access to this device");

            var userAccess = new DeviceUserAccess
            {
                DeviceId = deviceId,
                UserId = userId,
            };

            _db.DeviceUserAccesses.Add(userAccess);
            await _db.SaveChangesAsync();
        }

        public async Task AssingAsync(Guid deviceId, Guid workspaceId)
        {
            var deviceToAssign = await _db.Devices.FindAsync(deviceId);
            var workspaceExist = await _db.Workspaces.AnyAsync(w => w.Id == workspaceId);
            if (deviceToAssign == null || !workspaceExist) throw new BadRequestException();

            if (deviceToAssign.WorkspaceId != null)
                throw new BadRequestException("Device is already assigned to another workspace");

            deviceToAssign.WorkspaceId = workspaceId;
            await _db.SaveChangesAsync();
        }

        public async Task<DeviceAccessLevel> CheckAccessAsync(Guid? userId = null, Guid? workspaceId = null, Guid? deviceId = null)
        {
            WorkspaceRole? role = null;

            if (userId.HasValue && deviceId.HasValue)
            {
                role = await _db.Devices
                    .Where(d => d.Id == deviceId && d.WorkspaceId != null)
                    .Select(d => _db.WorkspaceMembers
                        .Where(wm => wm.WorkspaceId == d.WorkspaceId && wm.UserId == userId)
                        .Select(wm => (WorkspaceRole?)wm.Role)
                        .FirstOrDefault()
                    )
                    .FirstOrDefaultAsync();
            }
            else if (userId.HasValue && workspaceId.HasValue)
            {
                role = await _db.WorkspaceMembers
                    .Where(wm => wm.UserId == userId && wm.WorkspaceId == workspaceId)
                    .Select(wm => (WorkspaceRole?)wm.Role)
                    .FirstOrDefaultAsync();
            }

            if (role.HasValue && role == WorkspaceRole.Moderator) return DeviceAccessLevel.FullAccess;
            else if (role.HasValue && role == WorkspaceRole.Member) return DeviceAccessLevel.Activate;
            else return DeviceAccessLevel.None;
        }

        public async Task<IEnumerable<BasicDeviceResponse>> GetAccessibleDevicesAsync(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) throw new NotFoundException("User was not found");

            if(user.IsAdmin)
            {
                return await _db.Devices.Select(d => new BasicDeviceResponse
                {
                    Id = d.Id,
                    IsPublicInWorkspace = d.IsPublicInWorkspace,
                    Name = d.Name,
                }).ToListAsync();
            }

            var devices = await _db.Devices
                .Where(d =>
                    d.UserAccesses.Any(ua => ua.UserId == userId) ||
                    d.GroupAccesses.Any(ga => ga.UserGroup!.GroupMembers.Any(m => m.UserId == userId)) ||
                    (d.IsPublicInWorkspace == true && _db.WorkspaceMembers.Any(wm => wm.WorkspaceId == d.WorkspaceId && wm.UserId == userId))
                ).Select(d => new BasicDeviceResponse
                {
                    Id = d.Id,
                    IsPublicInWorkspace = d.IsPublicInWorkspace,
                    Name = d.Name,
                }).ToListAsync();

            return devices;
        }

        public async Task<IEnumerable<DeviceResponse>> GetAllAsync()
        {
            await SyncBrokerAsync();

            var devices = await _db.Devices
                .Select(d => new DeviceResponse
                {
                    Id = d.Id,
                    LastSeen = d.LastSeen,
                    UnlockMode = d.UnlockMode,
                    IsPublicInWorkspace = d.IsPublicInWorkspace ?? false,
                    Name = d.Name,
                    MacAddress = d.MacAddress,
                    WorkspaceId = d.WorkspaceId
                }).OrderByDescending(d => d.LastSeen).ToListAsync();

            return devices;
        }

        public async Task<IEnumerable<DeviceResponse>> GetAllFromWorkspaceAsync(Guid workspaceId)
        {
            await SyncBrokerAsync();

            var devices = await _db.Devices
                .Where(d => d.WorkspaceId == workspaceId)
                .Select(d => new DeviceResponse
                {
                    Id = d.Id,
                    LastSeen = d.LastSeen,
                    UnlockMode = d.UnlockMode,
                    IsPublicInWorkspace = d.IsPublicInWorkspace ?? false,
                    Name = d.Name,
                    MacAddress = d.MacAddress,
                    WorkspaceId = d.WorkspaceId
                }).ToListAsync();

            return devices;
        }

        public async Task<DeviceDetailsResponse> GetSingleAsync(Guid deviceId)
        {
            await SyncBrokerAsync();

            var device = await _db.Devices
                .Where(d => d.Id == deviceId)
                .Select(d => new DeviceDetailsResponse
                {
                    Id = d.Id,
                    Name = d.Name,
                    UnlockMode = d.UnlockMode,
                    LastSeen = d.LastSeen,
                    WorkspaceId = d.WorkspaceId,
                    Workspace = d.Workspace == null ? null : new WorkspaceResponse
                    {
                        Id = d.Workspace.Id,
                        Name = d.Workspace.Name
                    },
                    IsPublicInWorkspace = d.IsPublicInWorkspace ?? false,
                    MacAddress = d.MacAddress,
                    GroupAccesses = d.GroupAccesses.Select(ga => new UserGroupResponse
                    {
                        Id = ga.UserGroupId,
                        Name = ga.UserGroup!.Name,
                        WorkspaceId = ga.UserGroup.WorkspaceId
                    }),
                    UserAccesses = d.UserAccesses.Select(ua => new UserResponse
                    {
                        Id = ua.UserId,
                        Email = ua.User!.Email,
                        Firstname = ua.User.Firstname,
                        Lastname = ua.User.Lastname,
                    })

                })
                .FirstOrDefaultAsync();

            if (device == null) throw new NotFoundException();

            return device;
        }

        public async Task RemoveAsync(Guid deviceId)
        {
            var deviceToRemove = await _db.Devices
                .Include(d => d.UserAccesses)
                .Include(d => d.GroupAccesses)
                .FirstOrDefaultAsync(d => d.Id == deviceId);

            if (deviceToRemove == null) throw new NotFoundException();

            _db.RemoveRange(deviceToRemove.UserAccesses);
            _db.RemoveRange(deviceToRemove.GroupAccesses);
            deviceToRemove.WorkspaceId = null;

            await _db.SaveChangesAsync();
        }

        public async Task RemoveGroupAccessAsync(Guid userGroupId, Guid deviceId)
        {
            var groupAccess = await _db.DeviceGroupAccesses
                .FirstOrDefaultAsync(dga => dga.DeviceId == deviceId && dga.UserGroupId == userGroupId);

            if (groupAccess == null) throw new BadRequestException("Provided group does not have access to this device");

            _db.DeviceGroupAccesses.Remove(groupAccess);
            await _db.SaveChangesAsync();
        }

        public async Task RemoveUserAccessAsync(Guid userId, Guid deviceId)
        {
            var userAccess = await _db.DeviceUserAccesses
                .FirstOrDefaultAsync(dua => dua.DeviceId == deviceId && dua.UserId == userId);

            if (userAccess == null) throw new BadRequestException("Provided user does not have access to this device");

            _db.DeviceUserAccesses.Remove(userAccess);
            await _db.SaveChangesAsync();
        }

        public async Task SyncBrokerAsync()
        {
            var emqxClients = await _emqxService.GetDevicesAsync();

            foreach (var client in emqxClients)
            {
                if (!client.ClientId.StartsWith("ESP32-")) continue;
                string macAddress = client.ClientId[6..];

                var existingDevice = await _db.Devices
                    .FirstOrDefaultAsync(d => d.MacAddress == macAddress);

                if (existingDevice == null)
                {
                    var deviceToAdd = new Device
                    {
                        MacAddress = macAddress,
                        LastSeen = DateTime.UtcNow,
                        IsPublicInWorkspace = false,
                    };
                    _db.Devices.Add(deviceToAdd);
                }
                else
                {
                    existingDevice.MacAddress = macAddress;
                    existingDevice.LastSeen = DateTime.UtcNow;
                }
            }

            await _db.SaveChangesAsync();
        }

        public async Task<DeviceResponse> UpdateAsync(Guid deviceId, UpdateDeviceRequest request)
        {
            var deviceToUpdate = await _db.Devices.FindAsync(deviceId);
            if (deviceToUpdate == null) throw new NotFoundException();

            deviceToUpdate.Name = request.Name;
            deviceToUpdate.UnlockMode = request.UnlockMode;
            deviceToUpdate.IsPublicInWorkspace = request.IsPublicInWorkspace;
            await _db.SaveChangesAsync();

            return new DeviceResponse
            {
                Id = deviceId,
                LastSeen = deviceToUpdate.LastSeen,
                UnlockMode = deviceToUpdate.UnlockMode,
                IsPublicInWorkspace = deviceToUpdate.IsPublicInWorkspace ?? false,
                MacAddress = deviceToUpdate.MacAddress,
                Name = deviceToUpdate.Name,
                WorkspaceId = deviceToUpdate.WorkspaceId
            };
        }

        public async Task VerifyOfflineUnlock(UnlockRequest request)
        {
            var user = await _db.Users.FindAsync(request.UserId);
            var device = await _db.Devices.FirstOrDefaultAsync(d => d.MacAddress == request.MacAddress);

            if (user == null) throw new NotFoundException("User was not found");
            if (device == null) throw new NotFoundException("Device was not found");

            var accesbileDevices = await GetAccessibleDevicesAsync(user.Id)
                ?? throw new ForbiddenException("User does not have any device accesses");
            
            if (!accesbileDevices.Any(ad => ad.Id == device.Id)) throw new ForbiddenException();

            var message = request.Nonce + request.UserId.ToString();
            var secretBytes = Encoding.UTF8.GetBytes(user.OfflineSecret);
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using (var hmac = new HMACSHA256(secretBytes))
            {
                var computedHashBytes = hmac.ComputeHash(messageBytes);
                var computedHash = Convert.ToHexString(computedHashBytes).ToLower();

                if (computedHash != request.Hash.ToLower())
                {
                    throw new UnauthorizedException();
                }
            }

            string topic = $"devices/{device.MacAddress}/cmd";
            string payload = $"open {5000}";

            await _emqxService.PublishMessageAsync(topic, payload);
        }
    }
}
