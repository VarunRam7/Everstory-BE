import * as bcrypt from 'bcryptjs';

// Change import

export async function hashPassword(password: string): Promise<string> {
  console.log('--->', bcrypt);
  const salt = await bcrypt.genSalt(10); // Explicitly generate salt
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
