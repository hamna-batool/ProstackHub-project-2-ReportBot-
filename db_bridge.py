#!/usr/bin/env python3
import sys
import json
import sqlite3

def main():
    if len(sys.argv) < 3:
        print("[]")
        return
    db_path = sys.argv[1]
    sql = sys.argv[2]
    params = json.loads(sys.argv[3]) if len(sys.argv) > 3 else []

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(sql, params)
        if sql.strip().upper().startswith("SELECT") or sql.strip().upper().startswith("PRAGMA"):
            rows = [dict(r) for r in cur.fetchall()]
            print(json.dumps(rows, default=str))
        else:
            conn.commit()
            print(json.dumps({"changes": conn.total_changes, "lastrowid": cur.lastrowid}))
        conn.close()
    except Exception as e:
        sys.stderr.write(f"SQLite bridge error: {str(e)}\n")
        print("[]")

if __name__ == "__main__":
    main()
