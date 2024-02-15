import * as fs from 'fs';

function pwdSafe(password: any): boolean {
  const wordlistsPath = './server/modules/wordlists/';

  // Read all files in the wordlists directory
  const files = fs.readdirSync(wordlistsPath);

  if (files.length === 0) {
    console.warn('Warning: No wordlists found.');
    return false;
  }

  for (const file of files) {
    if (file.endsWith('.txt')) {
      const wordlistPath = `${wordlistsPath}${file}`;

      // Read the contents of the wordlist
      const wordlist = fs.readFileSync(wordlistPath, 'utf-8');

      // Check if the lowercase password is in the wordlist
      if (wordlist.toLowerCase().includes(password.toLowerCase())) {
        console.log(`Password found in ${file}`);
        return true;
      }
    }
  }

  return false;
}
export default {isSafe:pwdSafe};
