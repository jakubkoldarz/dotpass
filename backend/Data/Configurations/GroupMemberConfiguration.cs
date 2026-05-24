using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class GroupMemberConfiguration : IEntityTypeConfiguration<GroupMember>
    {
        public void Configure(EntityTypeBuilder<GroupMember> builder)
        {
            builder.HasKey(gm => new { gm.UserId, gm.UserGroupId });

            builder.HasOne(gm => gm.User)
                .WithMany(u => u.GroupMemberships)
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(gm => gm.UserGroup)
                .WithMany(g => g.GroupMembers)
                .HasForeignKey(gm => gm.UserGroupId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
