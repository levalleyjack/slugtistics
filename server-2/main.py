from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
# Allow *any* origin to hit every endpoint:
CORS(app, resources={r"/*": {"origins": "*"}})
DB_PATH = os.path.join(os.path.dirname(__file__), 'slugtistics.db')


# Helper to query the database
def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, args)
    rows = cur.fetchall()
    conn.close()
    return (rows[0] if rows else None) if one else rows

# Route 1: Get all unique classes
@app.route('/classes', methods=['GET'])
def get_all_classes():
    rows = query_db('SELECT DISTINCT "SubjectCatalogNbr" FROM GradeData ORDER BY SubjectCatalogNbr')
    classes = [row['SubjectCatalogNbr'] for row in rows]
    return jsonify(classes)

# Route 2: Get full info for a given class (includes P/NP and W)
@app.route('/class-info/<subject_catalog_nbr>', methods=['GET'])
def get_class_info(subject_catalog_nbr):
    rows = query_db('SELECT * FROM GradeData WHERE SubjectCatalogNbr = ?', [subject_catalog_nbr])
    result = []
    for row in rows:
        result.append({
            "SubjectCatalogNbr": row["SubjectCatalogNbr"],
            "Term": row["Term"],
            "Instructors": row["Instructors"],
            "Grades": {
                "A+": row["A+"], "A": row["A"], "A-": row["A-"],
                "B+": row["B+"], "B": row["B"], "B-": row["B-"],
                "C+": row["C+"], "C": row["C"], "C-": row["C-"],
                "D+": row["D+"], "D": row["D"], "D-": row["D-"],
                "F": row["F"],
                "P": row["P"], "NP": row["NP"],
                "W": row["W"]
            }
        })

    return jsonify(result)


if __name__ == '__main__':
    app.run(port=8080, debug=True)
