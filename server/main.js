import "dotenv/config";
import express from "express";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";

const app = express();
const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);
const frontendPath = join(dirname(currentFilePath), "client/build");
const dbPath = join(dirname(currentFilePath), "slugtistics.db");

app.use(express.static(frontendPath));
app.use(cors());

//===================================================================================================
//dropdown menus
//populating the dropdown menu with all the classes
app.get("/SubjectCatalogNbr", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all('SELECT DISTINCT "SubjectCatalogNbr" FROM spring2022', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    } else {
      const classTitles = rows.map((row) => row["SubjectCatalogNbr"]);
      res.json(classTitles);
    }
    db.close();
  });
});

app.get("/instructors/:subjectCatalogNbr", (req, res) => {
  const { subjectCatalogNbr } = req.params;

  const db = new sqlite3.Database(dbPath);
  db.all(
    'SELECT DISTINCT "Instructors" FROM spring2022 WHERE "SubjectCatalogNbr" = ?',
    [subjectCatalogNbr],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
      } else {
        const instructors = rows.map((row) => row["Instructors"]);
        res.json(instructors);
      }
      db.close();
    }
  );
});

//===================================================================================================
// actual querey from the dropdown menus
// route to retrieve grade distribution for a selected class
app.get("/grade-distribution/:subjectCatalogNbr", (req, res) => {
  const { subjectCatalogNbr } = req.params;
  const { term, instructor } = req.query;

  let sqlQuery = `SELECT 
    SUM("A+") as "A+", SUM("A") as "A", SUM("A-") as "A-", 
    SUM("B+") as "B+", SUM("B") as "B", SUM("B-") as "B-", 
    SUM("C+") as "C+", SUM("C") as "C", SUM("C-") as "C-", 
    SUM("D+") as "D+", SUM("D") as "D", SUM("D-") as "D-", 
    SUM("F") as "F"
    FROM spring2022 WHERE "SubjectCatalogNbr" = ?`;

  const params = [subjectCatalogNbr];

  if (term && term !== "All") {
    sqlQuery += " AND Term = ?";
    params.push(term);
  }

  if (instructor && instructor !== "All") {
    sqlQuery += " AND Instructors = ?";
    params.push(instructor);
  }

  const db = new sqlite3.Database(dbPath);
  db.get(sqlQuery, params, (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(row);
    }
    db.close();
  });
});

//this was my test route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
