using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class DeviceUserAccessConfiguration : IEntityTypeConfiguration<DeviceUserAccess>
    {
        public void Configure(EntityTypeBuilder<DeviceUserAccess> builder)
        {
            builder.HasKey(dua => new { dua.UserId, dua.DeviceId });

            builder.HasOne(dua => dua.User)
                .WithMany(u => u.DeviceAccesses)
                .HasForeignKey(dua => dua.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(dua => dua.Device)
                .WithMany(d => d.UserAccesses)
                .HasForeignKey(dua => dua.DeviceId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
