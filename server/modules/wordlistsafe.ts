import * as fs from "fs";

function pwdSafe(password: any): boolean {
  const wordlistsPath = "./server/modules/wordlists/";
                                                                                                   
  const files = fs.readdirSync(wordlistsPath);

  if (files.length === 0) {
    console.warn("Warning: No wordlists found.");
    return false;
  }

  for (const file of files) {
    if (file.endsWith(".txt")) {
      const wordlistPath = `${wordlistsPath}${file}`;
                                                                                                   
      const wordlist = fs.readFileSync(wordlistPath, "utf-8");
      if (wordlist.toLowerCase().includes(password.toLowerCase())) {
        console.log(`Password found in ${file}`);
        return true;
      }
    }
  }

  return false;
}
export default { isSafe: pwdSafe };
