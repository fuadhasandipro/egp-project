import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

import AppDataSource from '../config/typeorm.config';
import { Role } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';

dotenv.config();

async function seed() {
  const ds = await AppDataSource.initialize();
  const roleRepo = ds.getRepository(Role);
  const userRepo = ds.getRepository(User);

  let adminRole = await roleRepo.findOneBy({ name: 'admin' });
  if (!adminRole) {
    adminRole = await roleRepo.save({ name: 'admin' });
  }

  const email = process.env.SEED_ADMIN_EMAIL || 'uno@egp.gov';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const existingAdmin = await userRepo.findOneBy({ email });
  if (!existingAdmin) {
    const hash = await bcrypt.hash(password, 10);
    await userRepo.save({ email, passwordHash: hash, role: adminRole });
    console.log('UNO admin seeded successfully.');
  } else {
    console.log('UNO admin already exists.');
  }

  await ds.destroy();
}

seed().catch(console.error);
