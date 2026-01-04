import 'reflect-metadata';
import { AppDataSource } from './data-source.js';
import { User } from './entities/user.entity.js';
import bcrypt from 'bcryptjs'; // Correct default import

async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  // Check if a user already exists
  const existingUser = await userRepository.findOne({ where: { email: 'admin@example.com' } });
  if (existingUser) {
    console.log('Admin user already exists. Skipping seed.');
    await AppDataSource.destroy();
    return;
  }

  // Create a new user
  const newUser = new User();
  newUser.email = 'admin@example.com';
  newUser.firstName = 'Admin';
  newUser.lastName = 'User';

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash('password123', salt);

  await userRepository.save(newUser);

  console.log('Database has been seeded with an admin user.');
  console.log('Email: admin@example.com');
  console.log('Password: password123');

  await AppDataSource.destroy();
}

seed().catch(error => console.error('Error seeding database:', error));
