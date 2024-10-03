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
//Access-Control-Allow-Origin : *
app.use(cors());



//===================================================================================================
//dropdown menus
//populating the dropdown menu with all the classes
app.get("/SubjectCatalogNbr", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all('SELECT DISTINCT "SubjectCatalogNbr" FROM GradeData ORDER BY SubjectCatalogNbr', (err, rows) => {
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
    'SELECT DISTINCT "Instructors" FROM GradeData WHERE "SubjectCatalogNbr" = ? ORDER BY Instructors',
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

//write me a route that retrieves all the quarters a class is offered
app.get("/quarters/:subjectCatalogNbr", (req, res) => {
  const { subjectCatalogNbr } = req.params;

  const db = new sqlite3.Database(dbPath);
  db.all(
    'SELECT DISTINCT "Term" FROM GradeData WHERE "SubjectCatalogNbr" = ?',
    [subjectCatalogNbr],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
      } else {
        const terms = rows.map((row) => row["Term"]).reverse();
        res.json(terms);
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
    FROM GradeData WHERE "SubjectCatalogNbr" = ?`;

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

app.get("/instructors/:subjectCatalogNbr/:term", (req, res) => {
  const { subjectCatalogNbr, term } = req.params;

  const db = new sqlite3.Database(dbPath);
  db.all(
    'SELECT DISTINCT "Instructors" FROM GradeData WHERE "SubjectCatalogNbr" = ? AND "Term" = ? ORDER BY Instructors',
    [subjectCatalogNbr, term],
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

app.get("/quarters/:subjectCatalogNbr/:instructor", (req, res) => {
  const { subjectCatalogNbr, instructor } = req.params;

  const db = new sqlite3.Database(dbPath);
  db.all(
    'SELECT DISTINCT "Term" FROM GradeData WHERE "SubjectCatalogNbr" = ? AND "Instructors" = ?',
    [subjectCatalogNbr, instructor],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
      } else {
        const terms = rows.map((row) => row["Term"]).reverse();
        res.json(terms);
      }
      db.close();
    }
  );
});



//this was my test route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});
