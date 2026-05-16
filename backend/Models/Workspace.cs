using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Workspace
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<WorkspaceMember> WorkspaceMembers { get; set; } = [];
        public ICollection<UserGroup> UserGroups { get; set; } = [];
        public ICollection<Device> Devices { get; set; } = [];
    }
}
