const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_Gh9nwqeuDv4a@ep-cool-hall-am8xxkh5.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
      }
    }
  });

  try {
    console.log("Checking connection to Neon DB...");
    await prisma.$connect();
    console.log("SUCCESS: Connected to Neon DB!");
    
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);
    
    await prisma.$disconnect();
  } catch (e) {
    console.error("FAILURE: Could not connect to Neon DB.");
    console.error(e);
    process.exit(1);
  }
}

main();
