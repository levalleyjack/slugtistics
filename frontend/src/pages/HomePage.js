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
//this is the main page of the website

const HomePage = () => {
  const classes = useStyles();
  const [classTitles, setClassTitles] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [instructorsList, setInstructorsList] = useState([]);
  const [instructor, setInstructor] = useState("All");
  const [term, setTerm] = useState("All");
  const [classInfo, setClassInfo] = useState([]);
  const [showPercentage, setShowPercentage] = useState(false);

  useEffect(() => {
    // Fetch initial chart data
    fetch(`https://api.slugtistics.com/api/grade-distribution/Sum:?instructor=All&term=All`)
      .then((response) => response.json())
      .then((data) => {
        setClassInfo(data);
      });

    // Fetch subject catalog numbers
    fetch("https://api.slugtistics.com/api/SubjectCatalogNbr")
      .then((response) => response.json())
      .then((data) => {
        setClassTitles(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch instructors when a class is selected
    if (selectedClass) {
      
      fetch(`https://api.slugtistics.com/api/instructors/${selectedClass}`)
        .then((response) => response.json())
        .then((data) => {
          setInstructorsList(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      // Fetch grade distribution for the selected class
      fetch(`https://api.slugtistics.com/api/grade-distribution/${selectedClass}?instructor=${instructor}&term=${term}`)
        .then((response) => response.json())
        .then((data) => {
          setClassInfo(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [selectedClass, instructor, term]);

  const handleClassSelect = (event, newValue) => {
    setInstructor("All");
    setSelectedClass(newValue);

    // Fetch instructors for the selected class
    if (newValue) {
      fetch(`https://api.slugtistics.com/api/instructors/${newValue}`)
        .then((response) => response.json())
        .then((data) => {
          setInstructorsList(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      // Fetch grade distribution for the selected class
      fetch(`https://api.slugtistics.com/api/grade-distribution/${newValue}?instructor=${instructor}&term=${term}`)
        .then((response) => response.json())
        .then((data) => {
          setClassInfo(data);
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
      `https://api.slugtistics.com/api/grade-distribution/${selectedClass}?instructor=${instructor}&term=${term}`
    )
      .then((response) => response.json())
      .then((data) => {
        setClassInfo(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  //get the average GPA
  const calculateAverageGPA = () => {
    let totalGPA = 0;
    let totalStudents = 0;

    Object.entries(classInfo).forEach(([grade, count]) => {
      const gpa = calculateGPA(grade);
      totalGPA += gpa * count;
      totalStudents += count;
    });

    const averageGPA = totalGPA / totalStudents;
    return averageGPA.toFixed(2);
  };

  const calculateGPA = (grade) => {
    switch (grade) {
      case "A+":
        return 4.0;
      case "A":
        return 4.0;
      case "A-":
        return 3.7;
      case "B+":
        return 3.3;
      case "B":
        return 3.0;
      case "B-":
        return 2.7;
      case "C+":
        return 2.3;
      case "C":
        return 2.0;
      case "C-":
        return 1.7;
      case "D+":
        return 1.3;
      case "D":
        return 1.0;
      case "D-":
        return 0.7;
      case "F":
        return 0.0;
      default:
        return 0.0;
    }
  };

  const averageGPA = calculateAverageGPA();
  console.log("Average GPA:", averageGPA);


  //==========================================================================================================//
  //chart.js magic

  // Calculate the total number of students
  const totalStudents = Object.values(classInfo).reduce(
    (acc, val) => acc + val,
    0
  );

  // Calculate the percentage values for each grade
  const percentageData = Object.values(classInfo).map((value) =>
    ((value / totalStudents) * 100).toFixed(2)
  );

  const getValues = () => {
    return showPercentage ? percentageData : Object.values(classInfo);
  };

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
        
        label: "Students",
        data: getValues(),
        backgroundColor: "rgba(85, 192, 192, 1)",
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return showPercentage ? value + "%" : value;
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Grade Distribution",
      },
    },
  };
  const chartContainerStyle = {
    position: "relative",
    cursor: "default",
    width: "1500px",
    height: "550px",
  };


  const showPercentageButtonStyle = {
    backgroundColor: "#111827",
    margin: "0.5rem",
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
            <TextField {...params} label="Search Classes" variant="outlined" />
          )}
        />
        <div class="container">
        <h2>Instructor:</h2>
        </div>
        <Select
          style={{ margin: " 0px 15px", width: "200px"}}
          value={instructor}
          onChange={handleInstructorSelect}
          className={classes.select}
        >
          <MenuItem value="All">All Instructors</MenuItem>
          {instructorsList.map((instructor) => (
            <MenuItem key={instructor} value={instructor}>
              {instructor}
            </MenuItem>
          ))}
        </Select>
        <div class="container">
        <h2>Term:</h2>
        </div>
        <Select
          style={{ margin: " 0px 15px", width: "200px"}}
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
          style={showPercentageButtonStyle}
          onClick={() => setShowPercentage((prev) => !prev)}
          className={classes.button}
        >
          {showPercentage ? "Show Raw Data" : "Show Percentage"}
        </Button>
      </div>
      <Paper elevation={3} className={classes.chart}>
        <Bar
          style={chartContainerStyle}
          data={chartData}
          options={chartOptions}
        />
      </Paper>
    </div>
  );
};

export default HomePage;
