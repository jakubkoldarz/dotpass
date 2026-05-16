using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Device
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(17)]
        public string MacAddress { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Name { get; set; }

        public bool? IsPublicInWorkspace { get; set; }

        [Required]
        public Guid WorkspaceId { get; set; }

        [ForeignKey(nameof(WorkspaceId))]
        public Workspace? Workspace { get; set; }

        public ICollection<DeviceGroupAccess> GroupAccesses { get; set; } = [];
        public ICollection<DeviceUserAccess> UserAccesses { get; set; } = [];
    }
}
