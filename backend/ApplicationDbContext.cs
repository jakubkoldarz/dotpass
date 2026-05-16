using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend
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

            // User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // User <-> WorkspaceMember (1:N)
            modelBuilder.Entity<WorkspaceMember>()
                .HasOne(wm => wm.User)
                .WithMany(u => u.WorkspaceMemberships)
                .HasForeignKey(wm => wm.UserId);
                
            // User <-> DeviceUserAccess (1:N)
            modelBuilder.Entity<DeviceUserAccess>()
                .HasOne(dua => dua.User)
                .WithMany(u => u.DeviceAccesses)
                .HasForeignKey(dua => dua.UserId);

            // User <-> GroupMembers (1:N)
            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.User)
                .WithMany(u => u.GroupMemberships)
                .HasForeignKey(gm => gm.UserId);

            // UserGroup <-> DeviceGroupAccess (1:N)
            modelBuilder.Entity<DeviceGroupAccess>()
                .HasOne(dga => dga.UserGroup)
                .WithMany(gr => gr.GroupAccesses)
                .HasForeignKey(dga => dga.UserGroupId);

            // UserGroup <-> GroupMembers (1:N)
            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.UserGroup)
                .WithMany(ug => ug.GroupMembers)
                .HasForeignKey(gm => gm.UserGroupId);

            // UserGroup <-> Workspace (1:N)
            modelBuilder.Entity<UserGroup>()
                .HasOne(ug => ug.Workspace)
                .WithMany(w => w.UserGroups)
                .HasForeignKey(ug => ug.WorkspaceId);

            // GroupMember
            modelBuilder.Entity<GroupMember>()
                .HasKey(gm => new { gm.UserGroupId, gm.UserId });

            // Device <-> DeviceUserAccess (1:N)
            modelBuilder.Entity<DeviceUserAccess>()
                .HasOne(dua => dua.Device)
                .WithMany(dv => dv.UserAccesses)
                .HasForeignKey(dua => dua.DeviceId);

            // Device <-> DeviceGroupAccess (1:N)
            modelBuilder.Entity<DeviceGroupAccess>()
                .HasOne(dga => dga.Device)
                .WithMany(dv => dv.GroupAccesses)
                .HasForeignKey(dga => dga.DeviceId);
            
            // Device <-> Workspace (1:N)
            modelBuilder.Entity<Device>()
                .HasOne(d => d.Workspace)
                .WithMany(w => w.Devices)
                .HasForeignKey(d => d.WorkspaceId);

            // Device
            modelBuilder.Entity<Device>()
                .HasIndex(d => d.MacAddress)
                .IsUnique();

            // DeviceUserAccess
            modelBuilder.Entity<DeviceUserAccess>()
                .HasKey(dua => new { dua.DeviceId, dua.UserId });
            
            // DeviceGroupAccess
            modelBuilder.Entity<DeviceGroupAccess>()
                .HasKey(dga => new { dga.DeviceId, dga.UserGroupId });

            // WorkspaceMember
            modelBuilder.Entity<WorkspaceMember>()
                .HasKey(wm => new { wm.WorkspaceId, wm.UserId });

            modelBuilder.Entity<WorkspaceMember>()
                .Property(wm => wm.Role)
                .HasConversion<string>();

            // Workspace <-> WorkspaceMember (1:N)
            modelBuilder.Entity<WorkspaceMember>()
                .HasOne(wm => wm.Workspace)
                .WithMany(w => w.WorkspaceMembers)
                .HasForeignKey(wm => wm.WorkspaceId);
        }
    }
}
