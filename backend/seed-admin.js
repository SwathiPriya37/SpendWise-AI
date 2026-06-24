const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    // Promote first user to ADMIN
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      console.log('No users found. Please register first.');
      return;
    }

    await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: 'ADMIN' }
    });
    console.log(`✅ Promoted ${firstUser.email} to ADMIN`);

    // Create sample audit logs for the admin dashboard
    const sampleLogs = [
      { action: 'USER_LOGIN', entity: 'User', entityId: firstUser.id, details: `User ${firstUser.email} logged in`, userId: firstUser.id },
      { action: 'EXPENSE_CREATED', entity: 'Expense', details: 'Groceries - $85.50', userId: firstUser.id },
      { action: 'BUDGET_CREATED', entity: 'Budget', details: 'Food budget - $500', userId: firstUser.id },
      { action: 'GOAL_UPDATED', entity: 'SavingsGoal', details: 'Emergency Fund updated to $2,500', userId: firstUser.id },
      { action: 'EXPENSE_CREATED', entity: 'Expense', details: 'Netflix subscription - $15.99', userId: firstUser.id },
      { action: 'PROFILE_UPDATED', entity: 'User', entityId: firstUser.id, details: 'Profile name updated', userId: firstUser.id },
      { action: 'BUDGET_CREATED', entity: 'Budget', details: 'Transport budget - $200', userId: firstUser.id },
      { action: 'EXPENSE_DELETED', entity: 'Expense', details: 'Duplicate entry removed', userId: firstUser.id },
      { action: 'EXPENSE_CREATED', entity: 'Expense', details: 'Electricity bill - $120', userId: firstUser.id },
      { action: 'USER_REGISTERED', entity: 'User', details: 'New user demo@example.com registered', userId: firstUser.id },
      { action: 'EXPENSE_CREATED', entity: 'Expense', details: 'Restaurant dinner - $65', userId: firstUser.id },
      { action: 'GOAL_UPDATED', entity: 'SavingsGoal', details: 'Vacation Fund contribution +$300', userId: firstUser.id },
    ];

    await prisma.auditLog.createMany({ data: sampleLogs });
    console.log(`✅ Created ${sampleLogs.length} sample audit log entries`);

    console.log('\n🎉 Admin seed complete! Login again to see the Admin Panel in the sidebar.');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
