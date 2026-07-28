import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

import AppDataSource from '../config/typeorm.config';
import { Institution } from '../database/entities/institution.entity';
import { Role } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';

dotenv.config();

async function seed() {
  const ds = await AppDataSource.initialize();
  const roleRepo = ds.getRepository(Role);
  const userRepo = ds.getRepository(User);
  const instRepo = ds.getRepository(Institution);

  const rolesToCreate = [
    'admin',
    'to',
    'ato',
    'head_teacher',
    'teacher',
  ] as const;
  const roles: Record<string, Role> = {};

  for (const roleName of rolesToCreate) {
    let role = await roleRepo.findOneBy({ name: roleName });
    if (!role) {
      role = await roleRepo.save({ name: roleName });
    }
    roles[roleName] = role;
  }

  let institution = await instRepo.findOneBy({ eiin: '123456' });
  if (!institution) {
    institution = await instRepo.save({
      name: 'Dhaka City Model School',
      eiin: '123456',
      type: 'Secondary',
      latitude: 23.8103,
      longitude: 90.4125,
    });
  }

  const defaultPassword = 'ChangeMe123!';
  const hash = await bcrypt.hash(defaultPassword, 10);
  const usersData = [
    { email: 'admin@egp.gov', role: roles.admin, institution: null },
    { email: 'to@egp.gov', role: roles.to, institution: null },
    { email: 'ato@egp.gov', role: roles.ato, institution: null },
    {
      email: 'headteacher@egp.gov',
      role: roles.head_teacher,
      institution,
    },
    { email: 'teacher@egp.gov', role: roles.teacher, institution },
  ];

  for (const data of usersData) {
    const existing = await userRepo.findOneBy({ email: data.email });
    if (!existing) {
      const newUser = userRepo.create({
        email: data.email,
        passwordHash: hash,
        role: data.role,
      });
      if (data.institution) {
        newUser.institution = data.institution;
      }
      await userRepo.save(newUser);
      console.log(`Seeded user: ${data.email} (${data.role.name})`);
    } else {
      console.log(`User already exists: ${data.email}`);
    }
  }

  await ds.destroy();
  console.log('Seeding complete! You can now log in with these accounts.');
}

seed().catch(console.error);
