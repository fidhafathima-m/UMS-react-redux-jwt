import bcrypt from "bcryptjs";

async function createAdmin() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Admin@123', salt);
  console.log('Hashed password:', hashedPassword);
}

createAdmin();