import sqllite from "bun:sqlite";
import * as cgraphy from "node:crypto";
// database operations
function dbopen(addr: string, create: boolean = true): sqllite {
  return new sqllite(addr, { create: create });
}
function dbmaketable(db: sqllite, table: string) {
  const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
  const stmt = db.prepare(sql);
  const result = stmt.get(table);

  if (!result) {
    db.exec(`CREATE TABLE ${table} (name TEXT PRIMARY KEY, value TEXT)`);
  }
}
function dbwrite(
  db: sqllite,
  table: string,
  name: string,
  value: string,
  mode: string = "overwrite",
) {
  dbmaketable(db, table);

  const sql = `SELECT * FROM ${table} WHERE name = ?`;
  const stmt = db.prepare(sql);
  const result = stmt.get(name);

  if (!result) {
    const stmtInsert = db.prepare(
      `INSERT INTO ${table} (name, value) VALUES (?, ?)`,
    );
    stmtInsert.run(name, value);
    // return;
  }

  if (mode == "overwrite") {
    const stmtUpdate = db.prepare(
      `UPDATE ${table} SET value = ? WHERE name = ?`,
    );
    stmtUpdate.run(value, name);
  } else if (mode == "append") {
    const stmtAppend = db.prepare(
      `UPDATE ${table} SET value = value || ? WHERE name = ?`,
    );
    stmtAppend.run(value, name);
  }
}
function dbread(db: sqllite, table: string, name: string) {
  dbmaketable(db, table);
  const sql = `SELECT value FROM ${table} WHERE name = ?`;
  const stmt = db.prepare(sql);
  const result = stmt.get(name);
  return result;
}

// AES operations

function aesEncrypt(
  mode: string,
  text: string,
  key: string,
  iv: string = "deblokDefaultIV",
): string {
  let keySize: number;
  let ivSize: number;

  switch (mode) {
    case "aes-128-cbc":
      keySize = 16;
      ivSize = 16;
      break;
    case "aes-192-cbc":
      keySize = 24;
      ivSize = 16;
      break;
    case "aes-256-cbc":
      keySize = 32;
      ivSize = 16;
      break;
    default:
      throw new Error("Unsupported AES mode");
  }

  const cipher = cgraphy.createCipheriv(
    mode,
    key.slice(0, keySize),
    iv.slice(0, ivSize),
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function aesDecrypt(
  mode: string,
  text: string,
  key: string,
  iv: string = "deblokDefaultIV",
): string {
  let keySize: number;
  let ivSize: number;

  switch (mode) {
    case "aes-128":
      keySize = 16;
      ivSize = 16;
      break;
    case "aes-192":
      keySize = 24;
      ivSize = 16;
      break;
    case "aes-256":
      keySize = 32;
      ivSize = 16;
      break;
    default:
      throw new Error("Unsupported AES mode");
  }
  mode = mode + "-cbc";
  const decipher = cgraphy.createDecipheriv(
    mode,
    key.slice(0, keySize),
    iv.slice(0, ivSize),
  );
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
const decodeauthpart = (encoded: string): string =>
  parseInt(encoded, 20).toString();
function auth_tokenvalidate_endpoint(body: any) {
  try {
    const b: any = body; // the body variable is actually a string, this is here to fix a ts error
    let authtoken = b.split(".");
    let error = false;
    let errors: any[] = [];
    if (!authtoken[1] || !authtoken[2] || !authtoken[3]) {
      error = true;
      errors[errors.length] = "Bad auth token format";
    }
    if (!b.startsWith("@dblok.")) {
      error = true;
      errors[errors.length] = "Invalid prefix";
    }
    if (!authtoken[1].startsWith("cr")) {
      error = true;
      errors[errors.length] = "No created time";
    }
    let exptime = decodeauthpart(authtoken[2].substring(1));
    let crtime = decodeauthpart(authtoken[1].substring(1));

    let now = Date.now();
    if (now > Number(exptime) || now > Number(crtime)) {
      // All good
    } else {
      error = true;
      errors[errors.length] =
        "The creation time and/or the expiry time is invalid.";
    }
    return [error, errors];
  } catch (e) {
    return [true, e];
  }
}

// Exports

const sql = { open: dbopen, write: dbwrite, read: dbread };
const crypto = { aes: { decrypt: aesDecrypt, encrypt: aesEncrypt } };
const auth = { validate: auth_tokenvalidate_endpoint };
export default {
  sql: sql,
  crypto: crypto,
  auth: auth,
};
