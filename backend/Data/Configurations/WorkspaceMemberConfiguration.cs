using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class WorkspaceMemberConfiguration : IEntityTypeConfiguration<WorkspaceMember>
    {
        public void Configure(EntityTypeBuilder<WorkspaceMember> builder)
        {
            builder.HasKey(wm => new { wm.UserId, wm.WorkspaceId });

            builder.HasOne(wm => wm.User)
                .WithMany(u => u.WorkspaceMemberships)
                .HasForeignKey(wm => wm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(wm => wm.Workspace)
                .WithMany(w => w.WorkspaceMembers)
                .HasForeignKey(wm => wm.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
