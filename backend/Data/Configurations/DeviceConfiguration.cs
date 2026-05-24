using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class DeviceConfiguration : IEntityTypeConfiguration<Device>
    {
        public void Configure(EntityTypeBuilder<Device> builder)
        {
            builder.HasIndex(d => d.MacAddress).IsUnique();

            builder.HasOne(d => d.Workspace)
                .WithMany(w => w.Devices)
                .HasForeignKey(d => d.WorkspaceId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
