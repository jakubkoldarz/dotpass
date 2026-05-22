using Microsoft.EntityFrameworkCore;
using backend.Models;
using System.Reflection;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> config) : base(config) {}

        public DbSet<User> Users { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<Workspace> Workspaces { get; set; }
        public DbSet<WorkspaceMember> WorkspaceMembers { get; set; }
        public DbSet<UserGroup> UserGroups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<DeviceGroupAccess> DeviceGroupAccesses { get; set; }
        public DbSet<DeviceUserAccess> DeviceUserAccesses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
