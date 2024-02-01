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
    dbmaketable(db, table);
    
    const sql = `SELECT * FROM ${table} WHERE name = ?`;
    const stmt = db.prepare(sql);
    const result = stmt.get(name);

    if (!result) {
        const stmtInsert = db.prepare(`INSERT INTO ${table} (name, value) VALUES (?, ?)`);
        stmtInsert.run(name, value);
        // return;
    }

    if (mode == "overwrite") {
        const stmtUpdate = db.prepare(`UPDATE ${table} SET value = ? WHERE name = ?`);
        stmtUpdate.run(value, name);
    } else if (mode == "append") {
        const stmtAppend = db.prepare(`UPDATE ${table} SET value = value || ? WHERE name = ?`);
        stmtAppend.run(value, name);
    }
}
function dbread(db: sqllite, table: string, name: string) {
    const sql = `SELECT value FROM ${table} WHERE name = ?`;
    const stmt = db.prepare(sql);
    const result = stmt.get(name);
    return result;
    
  }



const sql = {open:dbopen,write:dbwrite,read:dbread}
const crypto = {}

export default { 
    sql:sql,crypto:crypto
}