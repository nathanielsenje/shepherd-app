# Sample Data Documentation

This document describes the sample data that has been seeded into the database for testing and development purposes.

## Overview

The database has been populated with realistic church management data to test all features of the API.

## Seeded Data Summary

### 👤 Admin Users (3)

| Email | Password | Role | Name |
|-------|----------|------|------|
| admin@church.org | Admin123! | SUPER_ADMIN | System Administrator |
| pastor@church.org | Admin123! | PASTORAL_STAFF | David Johnson |
| staff@church.org | Admin123! | ADMIN_STAFF | Sarah Williams |

### 🏠 Households (4)

1. **Smith Family** - 123 Oak Street, Springfield, IL 62701
2. **Johnson Family** - 456 Maple Avenue, Springfield, IL 62702
3. **Williams Family** - 789 Pine Road, Springfield, IL 62703
4. **Brown Family** - 321 Elm Street, Springfield, IL 62704

### 👥 Members (8)

#### Smith Family
- **John Smith** (Member) - john.smith@example.com
  - Male, DOB: 1985-03-15
  - Phone: 555-1001
  - First Visit: 2020-01-15
  - Covenant Partner, Small Group Leader

- **Mary Smith** (Member) - mary.smith@example.com
  - Female, DOB: 1987-07-22
  - Phone: 555-1002
  - Children's Ministry Leader

- **Emily Smith** (Member, Child)
  - Female, DOB: 2015-05-10
  - Has safety data and authorized pickup persons

#### Johnson Family
- **Michael Johnson** (Regular Attender) - michael.johnson@example.com
  - Male, DOB: 1990-11-08
  - Phone: 555-2001
  - Connect Group Member

- **Lisa Johnson** (Regular Attender) - lisa.johnson@example.com
  - Female, DOB: 1992-02-14
  - Phone: 555-2002
  - Connect Group Member, Serving Team Helper

#### Williams Family
- **Robert Williams** (Member) - robert.williams@example.com
  - Male, DOB: 1978-09-25
  - Phone: 555-3001
  - Worship Leader, Connect Group Leader
  - Skills: Guitar (Advanced), Vocals (Intermediate)

#### Brown Family
- **James Brown** (Newcomer) - james.brown@example.com
  - Male, DOB: 1995-12-03
  - Phone: 555-4001
  - First Visit: 2024-10-01

#### Individual Members
- **Sarah Miller** (Visitor) - sarah.miller@example.com
  - Female, DOB: 1993-04-18
  - Phone: 555-5001
  - First Visit: 2024-09-15

### 👨‍👩‍👧 Family Relationships (4)

- John Smith ↔ Mary Smith (SPOUSE)
- John Smith → Emily Smith (PARENT, Primary Custody)
- Mary Smith → Emily Smith (PARENT, Primary Custody)
- Michael Johnson ↔ Lisa Johnson (SPOUSE)

### 🛡️ Children's Safety Data

- **Emily Smith**
  - Medical Alerts: Allergic to peanuts
  - Allergies: Peanuts, Tree nuts
  - Age Category: PRIMARY
  - Authorized Pickup: John Smith, Mary Smith
  - Two-Person Access Required: Yes

### 🤝 Connect Groups (2)

1. **Young Professionals Group**
   - Type: LIFE_STAGE
   - Leader: Robert Williams
   - Meets: Wednesdays at 7:00 PM, Room 201
   - Capacity: 15
   - Members: Robert Williams (Leader), Michael Johnson, Lisa Johnson

2. **North Springfield Group**
   - Type: GEOGRAPHIC
   - Leader: John Smith
   - Meets: Thursdays at 6:30 PM, Smith Residence
   - Capacity: 12
   - Members: John Smith (Leader), Mary Smith (Co-Leader)

### 🙌 Serving Teams (2)

1. **Worship Team**
   - Ministry Area: Worship
   - Leader: Robert Williams
   - Schedule: Sunday mornings
   - Background Check Required: No
   - Members: Robert Williams (Worship Leader)

2. **Children's Ministry**
   - Ministry Area: Kids
   - Leader: Mary Smith
   - Schedule: Rotating Sundays
   - Background Check Required: Yes
   - Members:
     - Mary Smith (Sunday School Teacher, Background Check Cleared)
     - Lisa Johnson (Helper, Background Check Pending)

### ⛪ Ministry Programs (1)

1. **Young Adults Ministry**
   - Category: YOUNG_ADULTS
   - Age Range: 18-35
   - Leader: Robert Williams
   - Participants: Robert Williams (Leader), Michael Johnson, Lisa Johnson

### 🎯 Member Milestones (7)

- **John Smith**: First Visit, Growth Track, Covenant Partner, Small Group (All Completed)
- **Michael Johnson**: First Visit, Small Group (Completed)
- **James Brown**: First Visit (Completed)

### 📜 Covenant Partnerships (3)

- John Smith (Active since 2020-06-01)
- Mary Smith (Active since 2020-06-01)
- Robert Williams (Active since 2018-08-15)

### 📝 Member Notes (3)

- John Smith: "Great leader, actively engaged in ministry" (Pastoral Note)
- Michael Johnson: "Interested in joining a serving team" (Follow-up)
- James Brown: "New visitor, follow up next week" (Follow-up)

### 🎸 Member Skills (4)

- Robert Williams: Guitar (Advanced), Vocals (Intermediate)
- Mary Smith: Teaching (Advanced)
- John Smith: Leadership (Advanced)

## How to Use This Data

### 1. Testing Authentication

Login with any of the admin users:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@church.org",
    "password": "Admin123!"
  }'
```

### 2. Testing Member Endpoints

Get all members:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/members
```

Get members not in groups (should return Sarah Miller, James Brown, etc.):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/members/unconnected
```

### 3. Testing Member Engagement

Get John Smith's engagement (should show groups, teams, milestones):
```bash
# First get John's ID from the members list
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/members/{john-smith-id}/engagement
```

### 4. Testing Different User Roles

Test with different permission levels:

- **Super Admin** (admin@church.org): Full access to all endpoints
- **Pastoral Staff** (pastor@church.org): Access to pastoral notes
- **Admin Staff** (staff@church.org): Administrative functions

## Resetting the Data

To reset the database and re-seed:

```bash
# Reset database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shepherd_db" \
  npx prisma migrate reset --skip-seed --force

# Run migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shepherd_db" \
  npx prisma migrate dev

# Seed data
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shepherd_db" \
  npm run prisma:seed
```

## Test Scenarios

### Scenario 1: New Visitor Journey
1. Create a new visitor
2. Add them to a connect group
3. Update their status to NEWCOMER
4. Add milestones as they progress
5. Convert to MEMBER status

### Scenario 2: Family Management
1. Create a household
2. Add family members
3. Create family relationships (spouse, parent-child)
4. Add children's safety data
5. Set up authorized pickup persons

### Scenario 3: Volunteer Onboarding
1. Find member (e.g., Michael Johnson interested in serving)
2. Add to serving team
3. Update background check status
4. Mark onboarding as completed
5. Track service hours

### Scenario 4: Connect Group Management
1. Create new connect group
2. Add members
3. Set group leader and co-leader
4. Track attendance
5. Monitor group capacity

## Data Relationships

```
Households
  ├── Members
  │     ├── Family Relationships
  │     ├── Milestones
  │     ├── Notes (by Staff Users)
  │     ├── Skills
  │     ├── Consents
  │     ├── Children Safety Data (for kids)
  │     │     └── Authorized Pickup Persons
  │     ├── Covenant Partnership
  │     ├── Group Memberships
  │     ├── Team Memberships
  │     └── Ministry Participation
  │
  └── Connect Groups (led by Members)
      └── Group Members

Serving Teams (led by Members)
  └── Team Members

Ministry Programs (led by Members)
  └── Ministry Participants
```

## Notes

- All passwords are the same for easy testing: `Admin123!`
- Phone numbers are fake (555-xxxx format)
- Email addresses use @example.com and @church.org domains
- Dates are realistic to show member journey progression
- Privacy flags and consent data are properly set
- Children's safety features are demonstrated with Emily Smith

## Next Steps

1. Test all API endpoints using the provided sample data
2. Verify role-based access control with different user logins
3. Test data relationships (households, families, groups)
4. Verify soft delete functionality
5. Test member engagement tracking
6. Validate audit logging
7. Test field-level encryption (if enabled)

For API documentation and interactive testing, visit: http://localhost:3000/api/docs
