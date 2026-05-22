using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class DeviceWorkspaceNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Devices_Workspaces_WorkspaceId",
                table: "Devices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkspaceMembers",
                table: "WorkspaceMembers");

            migrationBuilder.DropIndex(
                name: "IX_WorkspaceMembers_UserId",
                table: "WorkspaceMembers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GroupMembers",
                table: "GroupMembers");

            migrationBuilder.DropIndex(
                name: "IX_GroupMembers_UserId",
                table: "GroupMembers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeviceUserAccesses",
                table: "DeviceUserAccesses");

            migrationBuilder.DropIndex(
                name: "IX_DeviceUserAccesses_UserId",
                table: "DeviceUserAccesses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeviceGroupAccesses",
                table: "DeviceGroupAccesses");

            migrationBuilder.DropIndex(
                name: "IX_DeviceGroupAccesses_UserGroupId",
                table: "DeviceGroupAccesses");

            migrationBuilder.AlterColumn<int>(
                name: "Role",
                table: "WorkspaceMembers",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "WorkspaceId",
                table: "Devices",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkspaceMembers",
                table: "WorkspaceMembers",
                columns: new[] { "UserId", "WorkspaceId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_GroupMembers",
                table: "GroupMembers",
                columns: new[] { "UserId", "UserGroupId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeviceUserAccesses",
                table: "DeviceUserAccesses",
                columns: new[] { "UserId", "DeviceId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeviceGroupAccesses",
                table: "DeviceGroupAccesses",
                columns: new[] { "UserGroupId", "DeviceId" });

            migrationBuilder.CreateIndex(
                name: "IX_Workspaces_Name",
                table: "Workspaces",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceMembers_WorkspaceId",
                table: "WorkspaceMembers",
                column: "WorkspaceId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_UserGroupId",
                table: "GroupMembers",
                column: "UserGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceUserAccesses_DeviceId",
                table: "DeviceUserAccesses",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroupAccesses_DeviceId",
                table: "DeviceGroupAccesses",
                column: "DeviceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Devices_Workspaces_WorkspaceId",
                table: "Devices",
                column: "WorkspaceId",
                principalTable: "Workspaces",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Devices_Workspaces_WorkspaceId",
                table: "Devices");

            migrationBuilder.DropIndex(
                name: "IX_Workspaces_Name",
                table: "Workspaces");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkspaceMembers",
                table: "WorkspaceMembers");

            migrationBuilder.DropIndex(
                name: "IX_WorkspaceMembers_WorkspaceId",
                table: "WorkspaceMembers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GroupMembers",
                table: "GroupMembers");

            migrationBuilder.DropIndex(
                name: "IX_GroupMembers_UserGroupId",
                table: "GroupMembers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeviceUserAccesses",
                table: "DeviceUserAccesses");

            migrationBuilder.DropIndex(
                name: "IX_DeviceUserAccesses_DeviceId",
                table: "DeviceUserAccesses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DeviceGroupAccesses",
                table: "DeviceGroupAccesses");

            migrationBuilder.DropIndex(
                name: "IX_DeviceGroupAccesses_DeviceId",
                table: "DeviceGroupAccesses");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "WorkspaceMembers",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "WorkspaceId",
                table: "Devices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkspaceMembers",
                table: "WorkspaceMembers",
                columns: new[] { "WorkspaceId", "UserId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_GroupMembers",
                table: "GroupMembers",
                columns: new[] { "UserGroupId", "UserId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeviceUserAccesses",
                table: "DeviceUserAccesses",
                columns: new[] { "DeviceId", "UserId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_DeviceGroupAccesses",
                table: "DeviceGroupAccesses",
                columns: new[] { "DeviceId", "UserGroupId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceMembers_UserId",
                table: "WorkspaceMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_UserId",
                table: "GroupMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceUserAccesses_UserId",
                table: "DeviceUserAccesses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceGroupAccesses_UserGroupId",
                table: "DeviceGroupAccesses",
                column: "UserGroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_Devices_Workspaces_WorkspaceId",
                table: "Devices",
                column: "WorkspaceId",
                principalTable: "Workspaces",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
