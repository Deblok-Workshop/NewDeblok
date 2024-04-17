import * as fs from "fs";

function pwdSafe(password: any): boolean {
  try {
    const files = fs.readdirSync("./server/modules/wordlists/");

    if (files.length === 0) {
      console.warn("Warning: No wordlists found.");
      return false;
    }

    for (const file of files) {
      if (file.endsWith(".txt")) {
        const wordlistPath = `./server/modules/wordlists/${file}`;

        const wordlist = fs.readFileSync(wordlistPath, "utf-8");
        if (wordlist.toLowerCase().includes(password.toLowerCase())) {
          console.log(`Password found in ${file}`);
          return true;
        }
      }
    }

    return false;
  } catch {
    console.warn("Warning: No wordlists found.");
    return false;
  }
}
export default { isSafe: pwdSafe };
