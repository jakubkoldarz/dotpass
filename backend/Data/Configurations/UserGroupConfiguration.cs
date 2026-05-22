using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class UserGroupConfiguration : IEntityTypeConfiguration<UserGroup>
    {
        public void Configure(EntityTypeBuilder<UserGroup> builder)
        {
            builder.HasOne(ug => ug.Workspace)
                .WithMany(w => w.UserGroups)
                .HasForeignKey(ug => ug.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
