# Database Migration Guide

This guide explains the database changes and how to apply them to your system.

## Changes Made

### 1. Removed DSC Certificate Field
- **Removed Column:** `dsc_certificate` from `users` table
- **Reason:** Simplified system by removing Digital Signature Certificate complexity

### 2. Added Profile Enhancement Fields
- **New Columns in `users` table:**
  - `phone` (VARCHAR(20)) - User phone number
  - `location` (VARCHAR(255)) - User location/address
  - `occupation` (VARCHAR(255)) - User current occupation/job title
  - `bio` (TEXT) - User professional biography

## Migration Instructions

### For New Installations

If you're setting up the system for the first time, simply run:

```bash
psql -U postgres -d your_database_name -f database/init.sql
```

The `init.sql` file already includes all the updated fields.

### For Existing Databases

If you already have a database running, you need to run the migration script:

```bash
psql -U postgres -d your_database_name -f database/migrations/001_add_profile_fields.sql
```

This migration script will:
1. Add the four new profile fields (`phone`, `location`, `occupation`, `bio`)
2. Add documentation comments to the columns
3. Verify that the columns were added successfully

## Backend API Updates

The backend now includes a new endpoint for profile updates:

### New Endpoint: `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+250788620201",
  "location": "Kigali, Rwanda",
  "occupation": "Software Engineer",
  "bio": "Experienced full-stack developer...",
  "profile_picture": "/uploads/profile_123.jpg",
  "signature": "/uploads/signature_123.jpg"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+250788620201",
    "location": "Kigali, Rwanda",
    "occupation": "Software Engineer",
    "bio": "Experienced full-stack developer...",
    "profile_picture": "/uploads/profile_123.jpg",
    "signature": "/uploads/signature_123.jpg",
    "role": "user",
    "created_at": "2026-02-08T10:00:00.000Z"
  }
}
```

### Updated Endpoint: `GET /api/auth/me`

Now returns additional profile fields:
- `phone`
- `location`
- `occupation`
- `bio`
- `profile_picture`
- `signature`
- `created_at`

## Verification

After running the migration, verify the changes:

```sql
-- Check the users table structure
\d users

-- Or view all columns
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

Expected columns in `users` table:
1. `id` (SERIAL PRIMARY KEY)
2. `email` (VARCHAR(255) UNIQUE NOT NULL)
3. `password_hash` (VARCHAR(255) NOT NULL)
4. `name` (VARCHAR(255))
5. `phone` (VARCHAR(20)) **← NEW**
6. `location` (VARCHAR(255)) **← NEW**
7. `occupation` (VARCHAR(255)) **← NEW**
8. `bio` (TEXT) **← NEW**
9. `profile_picture` (VARCHAR(255))
10. `signature` (VARCHAR(255))
11. `reset_token` (VARCHAR(255))
12. `reset_token_expires` (TIMESTAMP)
13. `created_at` (TIMESTAMP)
14. `active` (BOOLEAN)
15. `activation_token` (VARCHAR(255))
16. `otp` (VARCHAR(10))
17. `otp_expires` (TIMESTAMP)
18. `role` (VARCHAR(50))

## Rollback (If Needed)

If you need to rollback the profile field additions:

```sql
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS location;
ALTER TABLE users DROP COLUMN IF EXISTS occupation;
ALTER TABLE users DROP COLUMN IF EXISTS bio;
```

## Testing the Changes

1. **Start the backend server:**
   ```bash
   cd backend && npm run dev
   ```

2. **Test the profile endpoint:**
   ```bash
   # Get user profile
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:4000/api/auth/me

   # Update user profile
   curl -X PUT \
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"John Doe","phone":"+250788620201","location":"Kigali","occupation":"Developer","bio":"Full-stack engineer"}' \
        http://localhost:4000/api/auth/profile
   ```

3. **Test in the frontend:**
   - Navigate to the Profile page
   - Toggle edit mode
   - Update your information
   - Save and verify the changes persist

## Troubleshooting

### Issue: "column does not exist"
**Solution:** Run the migration script `001_add_profile_fields.sql`

### Issue: "duplicate column name"
**Solution:** The columns already exist. Check with `\d users` in psql

### Issue: Profile updates not saving
**Solution:** 
1. Check backend logs for errors
2. Verify JWT token is valid
3. Ensure backend is running on correct port
4. Check CORS settings if frontend and backend on different ports

## Notes

- All new fields are optional (can be NULL)
- Existing user data will not be affected
- The migration is backward compatible
- Frontend profile page is already updated to use these fields
