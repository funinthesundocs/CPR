# User Permissions System

This document describes the role-based access control (RBAC) system for the Court of Public Record platform.

## Overview

Access control is managed through a matrix of **Roles** and **Permissions**. Each user is assigned one or more roles, and each role grants specific permissions that control access to pages, features, and actions throughout the application.

## Roles

The platform defines 11 distinct roles organized by participation level and authority:

### Participants
- **Plaintiff** (⚖️) - Initiates cases and submits claims
- **Defendant** (🛡️) - Responds to cases and provides defense
- **Witness** (👁️) - Provides testimony and evidence
- **Jury Member** (👥) - Votes on case outcomes

### Contributors
- **Attorney** (📜) - Legal representation and case management
- **Expert Witness** (🔬) - Specialized testimony and analysis
- **Investigator** (🔍) - Evidence collection and verification

### Authority
- **Law Enforcement** (🚔) - Official capacity participation

### Management
- **Moderator** (🛠️) - Content moderation and community management
- **Admin** (👑) - Administrative access to all non-system features
- **Super Admin** (⭐) - Full system access including all features

## Permissions

Permissions are organized into 6 categories with 19 total permissions:

### Case Management (2 permissions)
- `manage_cases` - Create, edit, and delete cases
- `respond_to_case` - Respond to case sections and provide counter-arguments

### Content (4 permissions)
- `submit_evidence` - Submit evidence to cases
- `submit_testimony` - Submit testimony to cases
- `comment` - Post comments and participate in discussions
- `flag_content` - Flag inappropriate or rule-violating content for review

### Moderation (4 permissions)
- `verify_evidence` - Verify and approve submitted evidence
- `moderate_content` - Review flagged content and make moderation decisions
- `delete_posts` - Delete user posts, comments, and inappropriate content
- `ban_users` - Temporarily or permanently ban users from the platform

### Voting (1 permission)
- `vote` - Cast votes on cases and case-related decisions

### Administration (5 permissions)
- `manage_users` - View, edit, and manage user accounts and profiles
- `manage_roles` - Create, edit, and assign user roles
- `manage_permissions` - Configure role permissions and access control
- `access_admin_dashboard` - Access administrative dashboard and tools

### Forms (4 permissions)
- `access_plaintiff_form` - Access and submit new cases as plaintiff
- `access_witness_form` - Access witness submission form
- `access_expert_witness_form` - Access expert witness submission form
- `access_investigator_form` - Access investigator submission form

## Permission Matrix Management

The permission matrix can be managed through the admin interface at `/admin/users/roles`. This interface allows administrators to:

- View all roles and their assigned permissions
- Toggle permissions for each role
- Filter permissions by category
- Track unsaved changes before committing

## Implementation Guidelines

### Checking Permissions in Code

When implementing features that require permission checks:

1. **Server-side checks** - Always validate permissions on the server before executing sensitive operations
2. **Client-side checks** - Use permission checks to show/hide UI elements for better UX
3. **Route protection** - Apply middleware to protect routes based on required permissions

### Example Permission Check Pattern

```typescript
// Check if user has specific permission
const hasPermission = (userId: string, permission: string) => {
  // Fetch user's roles from database
  // Check if any role grants the permission
  // Return boolean
}

// Protect a page
if (!hasPermission(user.id, 'manage_cases')) {
  redirect('/unauthorized')
}
```

### Database Schema

Permissions are stored in a junction table that maps roles to permissions:

```sql
-- Example structure (adapt to your schema)
CREATE TABLE role_permissions (
  role_id VARCHAR(255),
  permission_id VARCHAR(255),
  granted BOOLEAN DEFAULT true,
  PRIMARY KEY (role_id, permission_id)
);
```

## Usage Examples

### Restricting Page Access

```typescript
// In a server component or middleware
const userRole = await getUserRole(userId)
const requiredPermission = 'access_admin_dashboard'

if (!roleHasPermission(userRole, requiredPermission)) {
  redirect('/') // or show error page
}
```

### Conditional UI Rendering

```typescript
// In a client component
const canManageCases = userPermissions.includes('manage_cases')

return (
  <>
    {canManageCases && (
      <Button onClick={handleCreateCase}>Create New Case</Button>
    )}
  </>
)
```

### Form Access Control

```typescript
// Different forms for different roles
const formAccess = {
  plaintiff: 'access_plaintiff_form',
  witness: 'access_witness_form',
  expert: 'access_expert_witness_form',
  investigator: 'access_investigator_form'
}

const canAccessForm = (userPerms: string[], formType: string) => {
  return userPerms.includes(formAccess[formType])
}
```

## Integration Checklist

When building new features, always consider:

- [ ] What permissions are required to access this feature?
- [ ] Should this be visible/accessible to certain roles only?
- [ ] Are server-side permission checks in place?
- [ ] Does the UI gracefully handle missing permissions?
- [ ] Are form submissions validated against user permissions?
- [ ] Are permission requirements documented in the feature spec?

## Future Considerations

- **Permission inheritance** - Consider role hierarchies where higher roles inherit lower role permissions
- **Custom permissions** - Allow creation of custom permissions for specific use cases
- **Time-based permissions** - Implement temporary permission grants
- **Audit logging** - Track permission changes and usage for security compliance
