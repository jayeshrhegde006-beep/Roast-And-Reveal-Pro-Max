import sqlite3
import json
import os

def export_db_to_json():
    # The database is now in the same directory as this script
    db_path = 'coffee_collection.db'
    
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    data = {}
    # All tables in your coffee ecosystem
    tables = ['coffees', 'regions', 'varieties', 'brewing_methods', 'roasters', 'products']
    
    for table in tables:
        try:
            cursor.execute(f"SELECT * FROM {table}")
            columns = [description[0] for description in cursor.description]
            rows = []
            for row in cursor.fetchall():
                rows.append(dict(zip(columns, row)))
            data[table] = rows
        except sqlite3.OperationalError as e:
            print(f"Skipping table {table}: {e}")
            
    # The JSON is also saved in the root for the website to use
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print("Database data successfully merged and exported to data.json.")

if __name__ == '__main__':
    export_db_to_json()
