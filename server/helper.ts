import sqllite from "bun:sqlite";

function dbopen(addr: string, readonly: boolean = false, create: boolean = false): sqllite {
    return new sqllite(addr, {readonly:readonly,create:create})
}
function dbwrite(db: sqllite, table: string, name: string, value: string, mode: string = "overwrite") {
    const sql = `SELECT * FROM ${table} WHERE name = ?`;
    const stmt = db.prepare(sql);
    const result = stmt.get(name);
  
    if (mode == "overwrite") {
      if (result) {
        stmt.run(`UPDATE ${table} SET value = ? WHERE name = ?`, value, name);
      } else {
        stmt.run(`INSERT INTO ${table} (name, value) VALUES (?, ?)`, name, value);
      }
    } else if (mode == "append") {
      if (result) {
        stmt.run(`UPDATE ${table} SET value = value || ? WHERE name = ?`, value, name);
      }
    }
}
function dbread(db: sqllite, table: string, name: string) {
    const sql = `SELECT value FROM ${table} WHERE name = ?`;
    const stmt = db.prepare(sql);
    const result = stmt.get(name);
  
    if (result) {
      return result;
    } else {
      return null;
    }
  }


  
const sql = {open:dbopen,write:dbwrite,read:dbread}
const crypto = {}

export default { 
    sql:sql,crypto:crypto
}