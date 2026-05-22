using backend.Data;
using backend.DTOs.Workspaces.Requests;
using backend.DTOs.Workspaces.Responses;
using backend.Exceptions;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class WorkspaceService(ApplicationDbContext _db) : IWorkspaceService
    {
        public async Task AddToWorkspaceAsync(Guid workspaceId, AddToWorkspaceRequest request)
        {
            var userExists = await _db.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists) throw new BadRequestException("User with provided ID does not exist");

            var workspaceExists = await _db.Workspaces.AnyAsync(w => w.Id == workspaceId);
            if (!workspaceExists) throw new BadRequestException("Workspace with provided ID does not exist");

            var membershipExists = await _db.WorkspaceMembers
                .AnyAsync(wm => wm.UserId == request.UserId && wm.WorkspaceId == workspaceId);
            if (membershipExists) throw new BadRequestException("User is already member of the workspace");

            var member = new WorkspaceMember
            {
                UserId = request.UserId,
                WorkspaceId = workspaceId,
                Role = request.Role
            };

            _db.WorkspaceMembers.Add(member);
            await _db.SaveChangesAsync();
        }

        public async Task<WorkspaceResponse> CreateAsync(CreateWorkspaceRequest request)
        {
            var workspaceExists = await _db.Workspaces.AnyAsync(w => w.Name  == request.Name);
            if(workspaceExists)
            {
                throw new BadRequestException("Workspace with provided name already exists");
            }

            var workspace = new Workspace { Name = request.Name };
            _db.Workspaces.Add(workspace);
            await _db.SaveChangesAsync();

            return new WorkspaceResponse { Name = workspace.Name, Id = workspace.Id };
        }

        public async Task DeleteAsync(Guid workspaceId)
        {
            var workspaceToDelete = await _db.Workspaces.FindAsync(workspaceId);

            if (workspaceToDelete == null) throw new NotFoundException();
            _db.Workspaces.Remove(workspaceToDelete);
            await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<WorkspaceResponse>> GetAllAsync()
        {
            var workspaces = await _db.Workspaces.ToListAsync();
            return [.. workspaces.Select(w => new WorkspaceResponse { Id = w.Id, Name = w.Name })];
        }
        public async Task<WorkspaceResponse> GetSingleAsync(Guid workspaceId)
        {
            var workspace = await _db.Workspaces.FindAsync(workspaceId);
            if (workspace == null) throw new NotFoundException();
            return new WorkspaceResponse { Id = workspace.Id, Name = workspace.Name };
        }

        public async Task RemoveFromWorkspaceAsync(Guid workspaceId, RemoveFromWorkspaceRequest request)
        {
            var userExists = await _db.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists) throw new BadRequestException("User with provided ID does not exist");

            var workspaceExists = await _db.Workspaces.AnyAsync(w => w.Id == workspaceId);
            if (!workspaceExists) throw new BadRequestException("Workspace with provided ID does not exist");

            var membershipToDelete = await _db.WorkspaceMembers
                .FirstOrDefaultAsync(wm => wm.UserId == request.UserId && wm.WorkspaceId == workspaceId);

            if (membershipToDelete == null) throw new BadRequestException("User is not a member of the workspace");

            _db.WorkspaceMembers.Remove(membershipToDelete);
            await _db.SaveChangesAsync();
        }

        public async Task<WorkspaceResponse> UpdateAsync(Guid workspaceId, UpdateWorkspaceRequest request)
        {
            var workspaceToUpdate = await _db.Workspaces.FindAsync(workspaceId);
            if(workspaceToUpdate == null) throw new NotFoundException();

            var workspaceExists = await _db.Workspaces.AnyAsync(w => w.Name == request.Name && w.Id != workspaceId);
            if(workspaceExists) throw new BadRequestException("Workspace with provided name already exists"); 

            workspaceToUpdate.Name = request.Name;
            await _db.SaveChangesAsync();

            return new WorkspaceResponse { Id = workspaceToUpdate.Id, Name = workspaceToUpdate.Name };
        }

        public async Task UpdateWorkspaceRoleAsync(Guid workspaceId, UpdateWorkspaceMemberRequest request)
        {
            var userExists = await _db.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists) throw new BadRequestException("User with provided ID does not exist");

            var workspaceExists = await _db.Workspaces.AnyAsync(w => w.Id == workspaceId);
            if (!workspaceExists) throw new BadRequestException("Workspace with provided ID does not exist");

            var membershipToUpdate = await _db.WorkspaceMembers
                .FirstOrDefaultAsync(wm => wm.UserId == request.UserId && wm.WorkspaceId == workspaceId);

            if (membershipToUpdate == null) throw new BadRequestException("User is not a member of the workspace");

            membershipToUpdate.Role = request.Role;
            await _db.SaveChangesAsync();
        }
    }
}
