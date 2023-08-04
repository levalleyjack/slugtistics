//==========================================================================================================//
//imports
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import Select from "@material-ui/core/Select";
//==========================================================================================================//
//styles (messing around)

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(1),
  },
  chart: {
    marginTop: theme.spacing(2),
  },
}));
//==========================================================================================================//
//homepage function and state declarations
const HomePage = () => {
  const classes = useStyles();
  const [classTitles, setClassTitles] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [instructorsList, setInstructorsList] = useState([]);
  const [instructor, setInstructor] = useState("All");
  const [term, setTerm] = useState("All");
  const [classInfo, setClassInfo] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  //==========================================================================================================//
  //handlers

  useEffect(() => {
    fetch("/SubjectCatalogNbr")
      .then((response) => response.json())
      .then((data) => {
        setClassTitles(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    //when a class is selected fetch the instructors for that class
    if (selectedClass) {
      fetch(`/instructors/${selectedClass}`)
        .then((response) => response.json())
        .then((data) => {
          setInstructorsList(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [selectedClass]);

  const handleClassSelect = (event, newValue) => {
    setSelectedClass(newValue);
    //fetch instructors for the selected class
    if (newValue) {
      fetch(`/instructors/${newValue}`)
        .then((response) => response.json())
        .then((data) => {
          setInstructorsList(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  const handleInstructorSelect = (event) => {
    setInstructor(event.target.value);
  };

  const handleTermSelect = (event) => {
    setTerm(event.target.value);
  };

  const handleGetInfo = () => {
    fetch(
      `/grade-distribution/${selectedClass}?instructor=${instructor}&term=${term}`
    )
      .then((response) => response.json())
      .then((data) => {
        setClassInfo(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  //==========================================================================================================//
  //chart.js magic

  const chartData = {
    labels: [
      "A+",
      "A",
      "A-",
      "B+",
      "B",
      "B-",
      "C+",
      "C",
      "C-",
      "D+",
      "D",
      "D-",
      "F",
    ],
    datasets: [
      {
        label: "Grade Distribution",
        data: Object.values(classInfo),
        backgroundColor: "rgba(85, 192, 192, 1)",
      },
    ],
  };

  //==========================================================================================================//
  //return statement
  return (
    <div className={classes.container}>
      <h1>Class Information</h1>
      <div>
        <Autocomplete
          options={classTitles}
          value={selectedClass}
          onChange={handleClassSelect}
          freeSolo
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Classes"
              variant="outlined"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        />
        <h2>Instructor:</h2>
        <Select
          value={instructor}
          onChange={handleInstructorSelect}
          className={classes.select}
        >
          <MenuItem value="All">All Instructors</MenuItem>
          {instructorsList.map((instructor, index) => (
            <MenuItem key={index} value={instructor}>
              {instructor}
            </MenuItem>
          ))}
        </Select>

        <h2>Term:</h2>
        <Select
          value={term}
          onChange={handleTermSelect}
          className={classes.select}
        >
          <MenuItem value="All">Spring 2022</MenuItem>
          {/* tbd */}
        </Select>

        <Button
          variant="contained"
          color="primary"
          onClick={handleGetInfo}
          className={classes.button}
        >
          Get Information
        </Button>
      </div>
      <Paper elevation={3} className={classes.chart}>
        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
      </Paper>
    </div>
  );
};

export default HomePage;
