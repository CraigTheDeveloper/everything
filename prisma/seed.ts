import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Settings (single instance)
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      theme: 'light',
      photoDirectory: './uploads/photos',
    },
  });
  console.log('Settings seeded');

  // Seed Time Categories (predefined system categories)
  const categories = [
    { name: 'Work', isWasteful: false, isSystem: true },
    { name: 'Study', isWasteful: false, isSystem: true },
    { name: 'Self-Improvement', isWasteful: false, isSystem: true },
    { name: 'Hobbies', isWasteful: false, isSystem: true },
    { name: 'Social', isWasteful: false, isSystem: true },
    { name: 'Time Wasting', isWasteful: true, isSystem: true },
    { name: 'Other', isWasteful: false, isSystem: true },
  ];

  for (const cat of categories) {
    await prisma.timeCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('Time categories seeded');

  // Seed some default activities for each category
  const workCategory = await prisma.timeCategory.findUnique({ where: { name: 'Work' } });
  const studyCategory = await prisma.timeCategory.findUnique({ where: { name: 'Study' } });
  const selfImprovementCategory = await prisma.timeCategory.findUnique({ where: { name: 'Self-Improvement' } });
  const hobbiesCategory = await prisma.timeCategory.findUnique({ where: { name: 'Hobbies' } });
  const socialCategory = await prisma.timeCategory.findUnique({ where: { name: 'Social' } });
  const timeWastingCategory = await prisma.timeCategory.findUnique({ where: { name: 'Time Wasting' } });

  const activities = [
    { name: 'Coding', categoryId: workCategory!.id, isSystem: true },
    { name: 'Meetings', categoryId: workCategory!.id, isSystem: true },
    { name: 'Email', categoryId: workCategory!.id, isSystem: true },
    { name: 'Reading', categoryId: studyCategory!.id, isSystem: true },
    { name: 'Online Course', categoryId: studyCategory!.id, isSystem: true },
    { name: 'Exercise', categoryId: selfImprovementCategory!.id, isSystem: true },
    { name: 'Meditation', categoryId: selfImprovementCategory!.id, isSystem: true },
    { name: 'Gaming', categoryId: hobbiesCategory!.id, isSystem: true },
    { name: 'Creative Projects', categoryId: hobbiesCategory!.id, isSystem: true },
    { name: 'Friends & Family', categoryId: socialCategory!.id, isSystem: true },
    { name: 'Social Media', categoryId: timeWastingCategory!.id, isSystem: true },
    { name: 'YouTube', categoryId: timeWastingCategory!.id, isSystem: true },
    { name: 'Mindless Browsing', categoryId: timeWastingCategory!.id, isSystem: true },
  ];

  for (const activity of activities) {
    await prisma.timeActivity.upsert({
      where: { name_categoryId: { name: activity.name, categoryId: activity.categoryId } },
      update: {},
      create: activity,
    });
  }
  console.log('Time activities seeded');

  // Seed Time Goal (default 60 minutes max waste)
  await prisma.timeGoal.upsert({
    where: { id: 1 },
    update: {},
    create: {
      maxWasteMinutes: 60,
    },
  });
  console.log('Time goal seeded');

  // Seed Pushup Goal for current year
  const currentYear = new Date().getFullYear();
  await prisma.pushupGoal.upsert({
    where: { year: currentYear },
    update: {},
    create: {
      year: currentYear,
      yearlyTarget: 36500,
    },
  });
  console.log('Pushup goal seeded');

  // Seed Body Goal (empty defaults)
  await prisma.bodyGoal.upsert({
    where: { id: 1 },
    update: {},
    create: {
      weeklyLossRate: 0.5,
    },
  });
  console.log('Body goal seeded');

  // Seed Level (starting level 1)
  await prisma.level.upsert({
    where: { id: 1 },
    update: {},
    create: {
      currentXP: 0,
      currentLevel: 1,
    },
  });
  console.log('Level seeded');

  // Seed Streaks - use empty string for global streaks since null doesn't work with unique constraint
  const streakTypes = [
    { type: 'perfect_day', moduleKey: '' },
    { type: 'showed_up', moduleKey: '' },
    { type: 'module', moduleKey: 'body' },
    { type: 'module', moduleKey: 'time' },
    { type: 'module', moduleKey: 'medication' },
    { type: 'module', moduleKey: 'pushups' },
    { type: 'module', moduleKey: 'dogs' },
    { type: 'module', moduleKey: 'oral' },
  ];

  for (const streak of streakTypes) {
    await prisma.streak.upsert({
      where: { type_moduleKey: { type: streak.type, moduleKey: streak.moduleKey } },
      update: {},
      create: streak,
    });
  }
  console.log('Streaks seeded');

  // Seed Achievements
  const achievements = [
    { key: 'first_steps', name: 'First Steps', description: 'Complete your first day of tracking', icon: 'footprints', xpReward: 50 },
    { key: 'on_fire', name: 'On Fire', description: '7-day perfect streak', icon: 'flame', xpReward: 200 },
    { key: 'iron_will', name: 'Iron Will', description: '30-day perfect streak', icon: 'shield', xpReward: 500 },
    { key: 'documented', name: 'Documented', description: '30 days of progress photos', icon: 'camera', xpReward: 300 },
    { key: 'dog_whisperer', name: 'Dog Whisperer', description: '100 total dog walks', icon: 'dog', xpReward: 400 },
    { key: 'compliant', name: 'Compliant', description: '95%+ medication compliance for a month', icon: 'pill', xpReward: 350 },
    { key: 'pearly_whites', name: 'Pearly Whites', description: '30-day oral hygiene streak', icon: 'smile', xpReward: 250 },
    { key: 'time_lord', name: 'Time Lord', description: 'Stay under time wasting goal for 7 days straight', icon: 'clock', xpReward: 200 },
    { key: 'century_club', name: 'Century Club', description: '100 pushups in a single day', icon: 'dumbbell', xpReward: 150 },
    { key: 'pushup_champion', name: 'Pushup Champion', description: 'Hit 36,500 yearly pushup goal', icon: 'trophy', xpReward: 1000 },
    { key: 'week_warrior', name: 'Week Warrior', description: 'Complete 7 consecutive days of logging', icon: 'calendar', xpReward: 100 },
    { key: 'comeback_kid', name: 'Comeback Kid', description: 'Return after missing 3+ days', icon: 'arrow-u-left-top', xpReward: 75, isHidden: true },
    { key: 'early_bird', name: 'Early Bird', description: 'Log all activities before noon for 7 days', icon: 'sun', xpReward: 150, isHidden: true },
    { key: 'night_owl', name: 'Night Owl', description: 'Log evening oral hygiene 30 days in a row', icon: 'moon', xpReward: 200 },
    { key: 'bodybuilder', name: 'Bodybuilder', description: 'Log body metrics for 60 consecutive days', icon: 'biceps-flexed', xpReward: 400 },
    { key: 'marathon_walker', name: 'Marathon Walker', description: 'Walk 42.195 km total distance', icon: 'map', xpReward: 300 },
    { key: 'thousand_pushups', name: 'Thousand Pushups', description: 'Complete 1000 total pushups', icon: 'dumbbell', xpReward: 200 },
    { key: 'ten_thousand_pushups', name: 'Ten Thousand Pushups', description: 'Complete 10,000 total pushups', icon: 'dumbbell', xpReward: 500 },
    { key: 'weight_loss_5', name: 'Down 5kg', description: 'Lose 5kg from your starting weight', icon: 'trending-down', xpReward: 300, isHidden: true },
    { key: 'level_10', name: 'Double Digits', description: 'Reach level 10', icon: 'star', xpReward: 200 },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: {
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        isHidden: achievement.isHidden || false,
      },
    });
  }
  console.log('Achievements seeded');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
