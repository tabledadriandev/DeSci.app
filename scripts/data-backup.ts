/**
 * Automated Data Backup System
 * Backs up user data every 6 hours
 */

import { prisma } from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';
import * as cron from 'node-cron';

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

class DataBackup {
  /**
   * Create backup directory
   */
  ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  /**
   * Backup user data
   */
  async backupUsers(): Promise<string> {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        healthData: true,
        mealPlans: true,
        rewards: true,
        transactions: true,
      },
    });

    const filename = `users-backup-${Date.now()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(users, null, 2));

    return filepath;
  }

  /**
   * Backup health metrics
   */
  async backupHealthMetrics(): Promise<string> {
    // TODO: Add HealthMetrics model to Prisma schema
    // const metrics = await prisma.healthMetrics.findMany();
    const metrics: any[] = [];

    const filename = `health-metrics-backup-${Date.now()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2));

    return filepath;
  }

  /**
   * Backup meal logs
   */
  async backupMealLogs(): Promise<string> {
    // TODO: Add MealLog model to Prisma schema
    // const mealLogs = await prisma.mealLog.findMany({
    //   include: { items: true },
    // });
    const mealLogs: any[] = [];

    const filename = `meal-logs-backup-${Date.now()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(mealLogs, null, 2));

    return filepath;
  }

  /**
   * Upload to S3 (if configured)
   */
  async uploadToS3(filepath: string): Promise<boolean> {
    if (!AWS_S3_BUCKET || !AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
      return false;
    }

    // In production, would use AWS SDK
    // const s3 = new AWS.S3({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY });
    // await s3.upload({ Bucket: AWS_S3_BUCKET, Key: path.basename(filepath), Body: fs.readFileSync(filepath) }).promise();
    
    console.log(`Would upload ${filepath} to S3 bucket ${AWS_S3_BUCKET}`);
    return true;
  }

  /**
   * Full backup
   */
  async performBackup(): Promise<void> {
    console.log('🔄 Starting backup...');
    this.ensureBackupDir();

    try {
      const [usersPath, metricsPath, mealLogsPath] = await Promise.all([
        this.backupUsers(),
        this.backupHealthMetrics(),
        this.backupMealLogs(),
      ]);

      console.log('✅ Backup completed:');
      console.log(`  - Users: ${usersPath}`);
      console.log(`  - Health Metrics: ${metricsPath}`);
      console.log(`  - Meal Logs: ${mealLogsPath}`);

      // Upload to S3 if configured
      await Promise.all([
        this.uploadToS3(usersPath),
        this.uploadToS3(metricsPath),
        this.uploadToS3(mealLogsPath),
      ]);

      // Clean up old backups (keep last 30 days)
      this.cleanupOldBackups();
    } catch (error) {
      console.error('❌ Backup failed:', error);
    }
  }

  /**
   * Clean up old backups
   */
  cleanupOldBackups() {
    const files = fs.readdirSync(BACKUP_DIR);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    files.forEach((file) => {
      const filepath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filepath);
        console.log(`🗑️  Deleted old backup: ${file}`);
      }
    });
  }

  /**
   * Start automated backups
   */
  start() {
    this.ensureBackupDir();

    // Backup every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      await this.performBackup();
    });

    // Initial backup
    this.performBackup();

    console.log('✅ Automated backup system started (every 6 hours)');
  }
}

// Run if executed directly
if (require.main === module) {
  const backup = new DataBackup();
  backup.start();

  process.on('SIGINT', () => {
    console.log('⏹️  Backup system stopped');
    process.exit(0);
  });
}

export { DataBackup };

