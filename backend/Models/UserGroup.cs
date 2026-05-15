using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class UserGroup
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid WorkspaceId { get; set; }

        [ForeignKey(nameof(WorkspaceId))]
        public Workspace? Workspace { get; set; }
    }
}
