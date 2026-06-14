using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MinLength(6)]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Firstname { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Lastname { get; set; } = string.Empty;
        public string OfflineSecret { get; set; } = string.Empty;

        public bool IsAdmin { get; set; }

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }

        public ICollection<WorkspaceMember> WorkspaceMemberships { get; set; } = [];
        public ICollection<DeviceUserAccess> DeviceAccesses { get; set; } = [];
        public ICollection<GroupMember> GroupMemberships { get; set; } = [];

    }
}
