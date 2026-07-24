import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your-new-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
// Next.js expands $VAR patterns in .env files, which collides with bcrypt's
// $2b$10$... format — dollar signs must be escaped as \$ or the hash gets
// silently mangled and login will always fail.
const escaped = hash.replace(/\$/g, "\\$");
console.log('\nPaste this into .env as: ADMIN_PASSWORD_HASH="' + escaped + '"\n');
