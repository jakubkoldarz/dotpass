using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class GroupMember
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid UserGroupId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [ForeignKey(nameof(UserGroupId))]
        public UserGroup? UserGroup { get; set; }
    }
}
