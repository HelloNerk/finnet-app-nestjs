# Multiple Roles Implementation

This document explains how to use the new multiple roles functionality in your FinNet application.

## Changes Made

1. **User Entity**: Changed from single `role` to multiple `roles` using comma-separated string storage
2. **DTOs**: Updated to support optional roles array
3. **Services**: Modified to handle roles array with default USER role
4. **Guards**: Updated to check if user has any of the required roles
5. **Decorators**: Modified to accept multiple roles

## Storage Implementation

Roles are stored as a comma-separated string in the database for efficiency:
- Database field: `rolesString` (TEXT type)
- Virtual getter/setter: `roles` (Role[] array)
- Example storage: `"EMISOR,BONISTA"` for a user with both roles

## Usage Examples

### 1. Creating a User with Multiple Roles

```typescript
// Register a user with multiple roles
const registerDto = {
  name: "John Doe",
  fullName: "John Alexander Doe",
  email: "john@example.com", 
  password: "password123",
  roles: [Role.EMISOR, Role.BONISTA] // User can be both EMISOR and BONISTA
};
```

### 2. Using the Roles Decorator

```typescript
// Allow access to users with EMISOR OR BONISTA role
@Roles(Role.EMISOR, Role.BONISTA)
@Get('bonds')
getBonds() {
  return this.bondsService.findAll();
}

// Allow access to users with ADMIN role only
@Roles(Role.ADMIN)
@Get('admin-panel')
getAdminPanel() {
  return this.adminService.getPanel();
}
```

### 3. Default Behavior

- If no roles are specified during user creation, the user gets `[Role.USER]` by default
- ADMIN users automatically have access to all protected routes
- Guards check if the user has ANY of the required roles (OR logic)

## Available Roles

- `EMISOR`: Bond issuer
- `BONISTA`: Bond holder/investor
- `USER`: Regular user (default)
- `ADMIN`: Administrator (full access)

## Database Schema

The `rolesString` field is stored as TEXT in MySQL with comma-separated values.

```sql
-- Example of how roles are stored
INSERT INTO user (name, fullName, email, password, rolesString) 
VALUES ('John', 'John Doe', 'john@example.com', 'hashedpassword', 'EMISOR,BONISTA');
```

## Benefits of Comma-Separated Storage

- **Performance**: Faster than JSON parsing
- **Simplicity**: Easy to read and understand
- **Compatibility**: Works with all SQL databases
- **Size**: More compact than JSON format
