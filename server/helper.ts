import sqllite from "bun:sqlite";

function dbopen(addr: string, create: boolean = false): sqllite {
    return new sqllite(addr, {create:create})
}
function dbmaketable(db: sqllite, table: string) {
    const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
    const stmt = db.prepare(sql);
    const result = stmt.get(table);
  
    if (!result) {
      db.exec(`CREATE TABLE ${table} (name TEXT PRIMARY KEY, value TEXT)`);
    }
  }
function dbwrite(db: sqllite, table: string, name: string, value: string, mode: string = "overwrite") {
    dbmaketable(db,table) // incase if it doesn't exist
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