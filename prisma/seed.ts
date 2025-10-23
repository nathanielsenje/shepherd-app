import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - comment out if you want to preserve data)
  console.log('\n🧹 Cleaning existing seed data...');

  // Delete in correct order to respect foreign key constraints
  await prisma.memberSkill.deleteMany({});
  await prisma.dataConsent.deleteMany({});
  await prisma.memberNote.deleteMany({});
  await prisma.covenantPartnership.deleteMany({});
  await prisma.memberMilestone.deleteMany({});
  await prisma.ministryParticipant.deleteMany({});
  await prisma.ministryProgram.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.servingTeam.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.connectGroup.deleteMany({});
  await prisma.authorizedPickupPerson.deleteMany({});
  await prisma.childrenSafetyData.deleteMany({});
  await prisma.familyRelationship.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.household.deleteMany({});
  await prisma.auditLog.deleteMany({});
  // Keep users for login

  console.log('✅ Cleaned existing data');

  // ========================================
  // 1. CREATE ADMIN USERS
  // ========================================
  console.log('\n👤 Creating admin users...');

  const hashedPassword = await hash('Admin123!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@church.org' },
    update: {},
    create: {
      email: 'admin@church.org',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  const pastoralStaff = await prisma.user.upsert({
    where: { email: 'pastor@church.org' },
    update: {},
    create: {
      email: 'pastor@church.org',
      passwordHash: hashedPassword,
      firstName: 'David',
      lastName: 'Johnson',
      role: 'PASTORAL_STAFF',
      isActive: true,
    },
  });

  const adminStaff = await prisma.user.upsert({
    where: { email: 'staff@church.org' },
    update: {},
    create: {
      email: 'staff@church.org',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Williams',
      role: 'ADMIN_STAFF',
      isActive: true,
    },
  });

  console.log('✅ Created 3 admin users');

  // ========================================
  // 2. CREATE HOUSEHOLDS
  // ========================================
  console.log('\n🏠 Creating households...');

  const households = await Promise.all([
    prisma.household.create({
      data: {
        name: 'Smith Family',
        primaryAddress: '123 Oak Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        householdPhone: '555-0101',
      },
    }),
    prisma.household.create({
      data: {
        name: 'Johnson Family',
        primaryAddress: '456 Maple Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        householdPhone: '555-0102',
      },
    }),
    prisma.household.create({
      data: {
        name: 'Williams Family',
        primaryAddress: '789 Pine Road',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62703',
        householdPhone: '555-0103',
      },
    }),
    prisma.household.create({
      data: {
        name: 'Brown Family',
        primaryAddress: '321 Elm Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62704',
        householdPhone: '555-0104',
      },
    }),
  ]);

  console.log(`✅ Created ${households.length} households`);

  // ========================================
  // 3. CREATE MEMBERS
  // ========================================
  console.log('\n👥 Creating members...');

  // Smith Family Members
  const johnSmith = await prisma.member.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '555-1001',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      status: 'MEMBER',
      householdId: households[0].id,
      firstVisitDate: new Date('2020-01-15'),
      consentDataStorage: true,
      consentCommunication: true,
      consentDate: new Date('2020-01-15'),
    },
  });

  const marySmith = await prisma.member.create({
    data: {
      firstName: 'Mary',
      lastName: 'Smith',
      email: 'mary.smith@example.com',
      phone: '555-1002',
      dateOfBirth: '1987-07-22',
      gender: 'Female',
      status: 'MEMBER',
      householdId: households[0].id,
      firstVisitDate: new Date('2020-01-15'),
      consentDataStorage: true,
      consentCommunication: true,
      consentDate: new Date('2020-01-15'),
    },
  });

  const emilySmith = await prisma.member.create({
    data: {
      firstName: 'Emily',
      lastName: 'Smith',
      dateOfBirth: '2015-05-10',
      gender: 'Female',
      status: 'MEMBER',
      householdId: households[0].id,
      isChild: true,
      firstVisitDate: new Date('2020-01-15'),
      consentDataStorage: true,
      consentCommunication: true,
      consentDate: new Date('2020-01-15'),
    },
  });

  // Johnson Family Members
  const michaelJohnson = await prisma.member.create({
    data: {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@example.com',
      phone: '555-2001',
      dateOfBirth: '1990-11-08',
      gender: 'Male',
      status: 'REGULAR_ATTENDER',
      householdId: households[1].id,
      firstVisitDate: new Date('2023-03-01'),
      consentDataStorage: true,
      consentCommunication: true,
      consentDate: new Date('2023-03-01'),
    },
  });

  const lisaJohnson = await prisma.member.create({
    data: {
      firstName: 'Lisa',
      lastName: 'Johnson',
      email: 'lisa.johnson@example.com',
      phone: '555-2002',
      dateOfBirth: '1992-02-14',
      gender: 'Female',
      status: 'REGULAR_ATTENDER',
      householdId: households[1].id,
      firstVisitDate: new Date('2023-03-01'),
      consentDataStorage: true,
      consentCommunication: true,
      consentDate: new Date('2023-03-01'),
    },
  });

  // Williams Family Members
  const robertWilliams = await prisma.member.create({
    data: {
      firstName: 'Robert',
      lastName: 'Williams',
      email: 'robert.williams@example.com',
      phone: '555-3001',
      dateOfBirth: '1978-09-25',
      gender: 'Male',
      status: 'MEMBER',
      householdId: households[2].id,
      firstVisitDate: new Date('2018-06-10'),
      consentDataStorage: true,
      consentCommunication: true,
      consentDate: new Date('2018-06-10'),
    },
  });

  // Brown Family Members
  const jamesBrown = await prisma.member.create({
    data: {
      firstName: 'James',
      lastName: 'Brown',
      email: 'james.brown@example.com',
      phone: '555-4001',
      dateOfBirth: '1995-12-03',
      gender: 'Male',
      status: 'NEWCOMER',
      householdId: households[3].id,
      firstVisitDate: new Date('2024-10-01'),
      consentDataStorage: true,
      consentCommunication: true,
      consentDate: new Date('2024-10-01'),
    },
  });

  // Individual members (not part of households)
  const sarahMiller = await prisma.member.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Miller',
      email: 'sarah.miller@example.com',
      phone: '555-5001',
      dateOfBirth: '1993-04-18',
      gender: 'Female',
      status: 'VISITOR',
      firstVisitDate: new Date('2024-09-15'),
      consentDataStorage: true,
      consentCommunication: false,
      consentDate: new Date('2024-09-15'),
    },
  });

  console.log('✅ Created 8 members');

  // ========================================
  // 4. CREATE FAMILY RELATIONSHIPS
  // ========================================
  console.log('\n👨‍👩‍👧 Creating family relationships...');

  await prisma.familyRelationship.createMany({
    data: [
      { member1Id: johnSmith.id, member2Id: marySmith.id, relationshipType: 'SPOUSE' },
      { member1Id: johnSmith.id, member2Id: emilySmith.id, relationshipType: 'PARENT', custodyIndicator: 'PRIMARY' },
      { member1Id: marySmith.id, member2Id: emilySmith.id, relationshipType: 'PARENT', custodyIndicator: 'PRIMARY' },
      { member1Id: michaelJohnson.id, member2Id: lisaJohnson.id, relationshipType: 'SPOUSE' },
    ],
  });

  console.log('✅ Created 4 family relationships');

  // ========================================
  // 5. CREATE CHILDREN SAFETY DATA
  // ========================================
  console.log('\n🛡️ Creating children safety data...');

  await prisma.childrenSafetyData.create({
    data: {
      childMemberId: emilySmith.id,
      medicalAlerts: 'Allergic to peanuts',
      allergies: 'Peanuts, Tree nuts',
      ageCategory: 'PRIMARY',
      requiresTwoPersonAccess: true,
      emergencyContactInfo: {
        name: 'John Smith',
        phone: '555-1001',
        relationship: 'Father',
      },
    },
  });

  await prisma.authorizedPickupPerson.createMany({
    data: [
      {
        childMemberId: emilySmith.id,
        authorizedPersonName: 'John Smith',
        relationship: 'Father',
        photoIdVerified: true,
        phoneNumber: '555-1001',
        isActive: true,
      },
      {
        childMemberId: emilySmith.id,
        authorizedPersonName: 'Mary Smith',
        relationship: 'Mother',
        photoIdVerified: true,
        phoneNumber: '555-1002',
        isActive: true,
      },
    ],
  });

  console.log('✅ Created children safety data');

  // ========================================
  // 6. CREATE CONNECT GROUPS
  // ========================================
  console.log('\n🤝 Creating connect groups...');

  const group1 = await prisma.connectGroup.create({
    data: {
      name: 'Young Professionals Group',
      description: 'Connect group for young professionals in their 20s and 30s',
      groupType: 'LIFE_STAGE',
      meetingSchedule: 'Wednesdays at 7:00 PM',
      meetingLocation: 'Room 201',
      capacity: 15,
      isActive: true,
      leaderId: robertWilliams.id,
    },
  });

  const group2 = await prisma.connectGroup.create({
    data: {
      name: 'North Springfield Group',
      description: 'Geographic group for north side residents',
      groupType: 'GEOGRAPHIC',
      meetingSchedule: 'Thursdays at 6:30 PM',
      meetingLocation: 'Smith Residence',
      capacity: 12,
      isActive: true,
      leaderId: johnSmith.id,
    },
  });

  await prisma.groupMember.createMany({
    data: [
      { groupId: group1.id, memberId: robertWilliams.id, role: 'LEADER', isActive: true },
      { groupId: group1.id, memberId: michaelJohnson.id, role: 'MEMBER', isActive: true },
      { groupId: group1.id, memberId: lisaJohnson.id, role: 'MEMBER', isActive: true },
      { groupId: group2.id, memberId: johnSmith.id, role: 'LEADER', isActive: true },
      { groupId: group2.id, memberId: marySmith.id, role: 'CO_LEADER', isActive: true },
    ],
  });

  console.log('✅ Created 2 connect groups with 5 members');

  // ========================================
  // 7. CREATE SERVING TEAMS
  // ========================================
  console.log('\n🙌 Creating serving teams...');

  const worshipTeam = await prisma.servingTeam.create({
    data: {
      name: 'Worship Team',
      ministryArea: 'Worship',
      description: 'Sunday morning worship service team',
      requirements: 'Musical ability or willingness to learn',
      leaderId: robertWilliams.id,
      schedule: 'Sunday mornings',
      timeCommitment: '3-4 hours per week',
      requiresBackgroundCheck: false,
      isActive: true,
    },
  });

  const childrenMinistry = await prisma.servingTeam.create({
    data: {
      name: 'Children\'s Ministry',
      ministryArea: 'Kids',
      description: 'Serve in Sunday school and children\'s programs',
      requirements: 'Love for children and patience',
      leaderId: marySmith.id,
      schedule: 'Rotating Sundays',
      timeCommitment: '2 hours every 3 weeks',
      requiresBackgroundCheck: true,
      isActive: true,
    },
  });

  await prisma.teamMember.createMany({
    data: [
      {
        teamId: worshipTeam.id,
        memberId: robertWilliams.id,
        rolePosition: 'Worship Leader',
        onboardingCompleted: true,
        rotation: 'WEEKLY',
        backgroundCheckStatus: 'NOT_REQUIRED',
        isActive: true,
      },
      {
        teamId: childrenMinistry.id,
        memberId: marySmith.id,
        rolePosition: 'Sunday School Teacher',
        onboardingCompleted: true,
        rotation: 'MONTHLY',
        backgroundCheckStatus: 'CLEARED',
        backgroundCheckDate: new Date('2023-01-15'),
        isActive: true,
      },
      {
        teamId: childrenMinistry.id,
        memberId: lisaJohnson.id,
        rolePosition: 'Helper',
        onboardingCompleted: false,
        rotation: 'MONTHLY',
        backgroundCheckStatus: 'PENDING',
        isActive: true,
      },
    ],
  });

  console.log('✅ Created 2 serving teams with 3 members');

  // ========================================
  // 8. CREATE MINISTRY PROGRAMS
  // ========================================
  console.log('\n⛪ Creating ministry programs...');

  const youngAdults = await prisma.ministryProgram.create({
    data: {
      name: 'Young Adults Ministry',
      category: 'YOUNG_ADULTS',
      description: 'Ministry for adults ages 18-35',
      ageRangeMin: 18,
      ageRangeMax: 35,
      leaderId: robertWilliams.id,
      isActive: true,
    },
  });

  await prisma.ministryParticipant.createMany({
    data: [
      { ministryId: youngAdults.id, memberId: robertWilliams.id, role: 'LEADER', isActive: true },
      { ministryId: youngAdults.id, memberId: michaelJohnson.id, role: 'PARTICIPANT', isActive: true },
      { ministryId: youngAdults.id, memberId: lisaJohnson.id, role: 'PARTICIPANT', isActive: true },
    ],
  });

  console.log('✅ Created 1 ministry program with 3 participants');

  // ========================================
  // 9. CREATE MEMBER MILESTONES
  // ========================================
  console.log('\n🎯 Creating member milestones...');

  await prisma.memberMilestone.createMany({
    data: [
      {
        memberId: johnSmith.id,
        milestoneType: 'FIRST_VISIT',
        status: 'COMPLETED',
        achievedDate: new Date('2020-01-15'),
      },
      {
        memberId: johnSmith.id,
        milestoneType: 'GROWTH_TRACK',
        status: 'COMPLETED',
        achievedDate: new Date('2020-02-20'),
      },
      {
        memberId: johnSmith.id,
        milestoneType: 'COVENANT_PARTNER',
        status: 'COMPLETED',
        achievedDate: new Date('2020-06-01'),
      },
      {
        memberId: johnSmith.id,
        milestoneType: 'SMALL_GROUP',
        status: 'COMPLETED',
        achievedDate: new Date('2020-07-15'),
      },
      {
        memberId: michaelJohnson.id,
        milestoneType: 'FIRST_VISIT',
        status: 'COMPLETED',
        achievedDate: new Date('2023-03-01'),
      },
      {
        memberId: michaelJohnson.id,
        milestoneType: 'SMALL_GROUP',
        status: 'COMPLETED',
        achievedDate: new Date('2023-09-10'),
      },
      {
        memberId: jamesBrown.id,
        milestoneType: 'FIRST_VISIT',
        status: 'COMPLETED',
        achievedDate: new Date('2024-10-01'),
      },
    ],
  });

  console.log('✅ Created 7 member milestones');

  // ========================================
  // 10. CREATE COVENANT PARTNERSHIPS
  // ========================================
  console.log('\n📜 Creating covenant partnerships...');

  await prisma.covenantPartnership.createMany({
    data: [
      {
        memberId: johnSmith.id,
        status: 'ACTIVE',
        signatureDate: new Date('2020-06-01'),
        witnessName: 'Pastor David Johnson',
      },
      {
        memberId: marySmith.id,
        status: 'ACTIVE',
        signatureDate: new Date('2020-06-01'),
        witnessName: 'Pastor David Johnson',
      },
      {
        memberId: robertWilliams.id,
        status: 'ACTIVE',
        signatureDate: new Date('2018-08-15'),
        witnessName: 'Pastor David Johnson',
      },
    ],
  });

  console.log('✅ Created 3 covenant partnerships');

  // ========================================
  // 11. CREATE MEMBER NOTES
  // ========================================
  console.log('\n📝 Creating member notes...');

  await prisma.memberNote.createMany({
    data: [
      {
        memberId: johnSmith.id,
        authorId: pastoralStaff.id,
        noteText: 'Great leader, actively engaged in ministry',
        noteType: 'PASTORAL',
        privacyLevel: 'PASTORAL_ONLY',
      },
      {
        memberId: michaelJohnson.id,
        authorId: adminStaff.id,
        noteText: 'Interested in joining a serving team',
        noteType: 'FOLLOWUP',
        privacyLevel: 'ADMIN_VISIBLE',
      },
      {
        memberId: jamesBrown.id,
        authorId: adminStaff.id,
        noteText: 'New visitor, follow up next week',
        noteType: 'FOLLOWUP',
        privacyLevel: 'ADMIN_VISIBLE',
      },
    ],
  });

  console.log('✅ Created 3 member notes');

  // ========================================
  // 12. CREATE MEMBER SKILLS
  // ========================================
  console.log('\n🎸 Creating member skills...');

  await prisma.memberSkill.createMany({
    data: [
      {
        memberId: robertWilliams.id,
        skillName: 'Guitar',
        proficiencyLevel: 'Advanced',
        availableToServe: true,
      },
      {
        memberId: robertWilliams.id,
        skillName: 'Vocals',
        proficiencyLevel: 'Intermediate',
        availableToServe: true,
      },
      {
        memberId: marySmith.id,
        skillName: 'Teaching',
        proficiencyLevel: 'Advanced',
        availableToServe: true,
      },
      {
        memberId: johnSmith.id,
        skillName: 'Leadership',
        proficiencyLevel: 'Advanced',
        availableToServe: true,
      },
    ],
  });

  console.log('✅ Created 4 member skills');

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  - 3 Admin Users');
  console.log('  - 4 Households');
  console.log('  - 8 Members');
  console.log('  - 4 Family Relationships');
  console.log('  - 2 Connect Groups');
  console.log('  - 2 Serving Teams');
  console.log('  - 1 Ministry Program');
  console.log('  - 7 Milestones');
  console.log('  - 3 Covenant Partnerships');
  console.log('  - 3 Notes');
  console.log('  - 4 Skills');
  console.log('\n🔐 Login Credentials:');
  console.log('  Super Admin: admin@church.org / Admin123!');
  console.log('  Pastoral Staff: pastor@church.org / Admin123!');
  console.log('  Admin Staff: staff@church.org / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
