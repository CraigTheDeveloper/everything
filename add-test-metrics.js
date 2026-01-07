const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const testData = [
    { date: new Date('2026-01-05'), weight: 77.0, bodyFatPercent: 16.5, musclePercent: 41.0, pointsEarned: 1 },
    { date: new Date('2026-01-04'), weight: 77.5, bodyFatPercent: 17.0, musclePercent: 40.5, pointsEarned: 1 },
    { date: new Date('2026-01-03'), weight: 78.0, bodyFatPercent: 17.2, musclePercent: 40.2, pointsEarned: 1 },
  ]

  for (const data of testData) {
    await prisma.bodyMetric.upsert({
      where: { date: data.date },
      update: data,
      create: data,
    })
  }
  console.log('Test metrics added!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
