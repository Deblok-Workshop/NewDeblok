import helper from "./helper.ts";
if (
  process.argv.includes("--license") ||
  process.argv.includes("--copyright") ||
  process.argv.includes("--copying")
) {
  console.log(`
NewDeblok is licensed under the GNU General Public License v3.0 (GPL-3.0)
You can find the full license text in the LICENSE file or at https://opensource.org/license/gpl-3-0/

- md5.js (https://pajhome.org.uk/crypt/md5/) is distributed under the BSD license, available at https://opensource.org/license/bsd-3-clause/
Please see https://pajhome.org.uk/site/legal.html#bsdlicense for more information.
    `);
  process.exit(0);
}

if (
  process.argv.includes("--help") ||
  process.argv.includes("-?") ||
  process.argv.includes("-h")
) {
  console.log(`
NewDeblok command line help:
--help, -? or -h returns this then exits
--copying, --copyright, or --license outputs license information then exits.

-u or --unavailable enters Unavailable Mode which disables users from accessing Deblok.
--no-linux-check disables the crash about DeblokManager only being compatible on Linux machines.
`);
  process.exit(0);
}

Bun.write("tempcaptcha.db", "{}");

try {
  require("node:fs").accessSync("db.sql", require("node:fs").constants.F_OK);
} catch {
  console.warn("WARN: db.sql does not exist. Creating.");
  Bun.write("db.sql", "");
}
try {
  require("node:fs").accessSync(".env", require("node:fs").constants.F_OK);
} catch {
  console.error("FATAL: .env file not found.");
  process.exit(1);
}

if (
  process.argv.includes("--ignore-linux-check") &&
  require("os").platform() != "linux"
) {
  console.warn("WARN: Incompatibility detected!");
  console.warn(
    "        - A hard dependency DeblokManager can only run on Linux devices.",
  );
  console.warn(
    "          This warning is being ignored due to --ignore-linux-check.",
  );
} else if (require("os").platform() != "linux") {
  console.error("FATAL: Incompatibility detected!");
  console.error(
    "        - A hard dependency DeblokManager can only run on Linux devices.",
  );
  console.error("          Pass --ignore-linux-check to ignore this warning");
  process.exit(2);
}
let endpoints: any = process.env.ENDPOINTS;
if (!endpoints) {
  throw new ReferenceError("Cannot find DeblokManager endpoints (check .env)");
}
if (!process.env.DBPWD) {
  throw new ReferenceError("No Database Password (check .env)");
}
endpoints = endpoints.split(",");

// make sure session table exists
let db = helper.sql.open("db.sql");
helper.sql.droptable(db, "sessions"); // drop table if exists, https://xkcd.com/327/
helper.sql.maketable(db, "sessions");
