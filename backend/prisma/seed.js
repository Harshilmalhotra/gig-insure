const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Create a demo user if it doesn't exist
  const user = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      phone: '9876543210',
      name: 'Demo Worker',
      password: 'password123',
      platform: 'Swiggy',
      baseEarnings: 800,
      baseRating: 4.8,
      consistencyScore: 0.92,
    },
  });

  // 2. Create an active policy
  const policy = await prisma.policy.create({
    data: {
      userId: user.id,
      premium: 45,
      coverage: 5000,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 3600000),
    }
  });

  // 3. Generate some historical claims
  const claimTypes = ['RAIN', 'HEAT', 'DEMAND_CRASH', 'OUTAGE'];
  for (let i = 0; i < 15; i++) {
    const date = new Date(Date.now() - (Math.random() * 5) * 24 * 3600000);
    const trigger = claimTypes[Math.floor(Math.random() * claimTypes.length)];
    const fraudScore = Math.random() < 0.2 ? 0.85 : 0.12; 
    
    await prisma.claim.create({
      data: {
        userId: user.id,
        policyId: policy.id,
        triggerType: trigger,
        payoutAmount: Math.floor(200 + Math.random() * 800),
        activityScore: 0.9,
        fraudScore: fraudScore,
        status: fraudScore > 0.7 ? 'PENDING' : 'PAID',
        createdAt: date
      }
    });
  }

  // 4. Create some other users
  for(let i=0; i<3; i++) {
    await prisma.user.create({
      data: {
        phone: `999000000${i}`,
        name: `Worker ${i}`,
        password: 'password',
        platform: i % 2 === 0 ? 'Zomato' : 'Swiggy',
        baseRating: 4.2 + (i*0.1),
        consistencyScore: 0.8,
      }
    });
  }

  console.log("Seeding complete!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
