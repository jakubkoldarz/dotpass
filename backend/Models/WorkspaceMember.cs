using backend.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class WorkspaceMember
    {
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public Guid WorkspaceId { get; set; }

        public WorkspaceRole Role { get; set; } = WorkspaceRole.Member;

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [ForeignKey(nameof(WorkspaceId))]
        public Workspace? Workspace { get; set; }
    }
}
