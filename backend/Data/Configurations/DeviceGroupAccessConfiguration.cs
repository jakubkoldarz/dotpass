using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class DeviceGroupAccessConfiguration : IEntityTypeConfiguration<DeviceGroupAccess>
    {
        public void Configure(EntityTypeBuilder<DeviceGroupAccess> builder)
        {
            builder.HasKey(dga => new { dga.UserGroupId, dga.DeviceId });

            builder.HasOne(dga => dga.UserGroup)
                .WithMany(g => g.DeviceAccesses)
                .HasForeignKey(dga => dga.UserGroupId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(dga => dga.Device)
                .WithMany(d => d.GroupAccesses)
                .HasForeignKey(dga => dga.DeviceId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
