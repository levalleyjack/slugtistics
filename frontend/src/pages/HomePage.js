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
  const [filteredQuarters, setFilteredQuarters] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);

  const [quarterList, setQuarterList] = useState([
    "2024 Spring Quarter",
    "2024 Winter Quarter",
    "2023 Fall Quarter",
    "2023 Summer Quarter",
    "2023 Spring Quarter",
    "2023 Winter Quarter",
    "2022 Fall Quarter",
    "2022 Summer Quarter",
    "2022 Spring Quarter",
    "2022 Winter Quarter",
    "2021 Fall Quarter",
    "2021 Summer Quarter",
    "2021 Spring Quarter",
    "2021 Winter Quarter",
    "2020 Fall Quarter",
    "2020 Summer Quarter",
    "2020 Spring Quarter",
    "2020 Winter Quarter",
    "2019 Fall Quarter",
  ]);

  const route = "http://localhost:8080/";

  useEffect(() => {
    //fetch initial chart data
    fetch(`${route}grade-distribution/Sum:?instructor=All&term=All`)
      .then((response) => response.json())
      .then((data) => {
        setClassInfo(data);
      });

    //fetch subject catalog numbers
    fetch(`${route}SubjectCatalogNbr`)
      .then((response) => response.json())
      .then((data) => {
        setClassTitles(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      //only fetch grade distribution when class, instructor, or term changes
      fetch(
        `${route}grade-distribution/${selectedClass}?instructor=${instructor}&term=${term}`
      )
        .then((response) => response.json())
        .then((data) => {
          setClassInfo(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [selectedClass, instructor, term]);

  useEffect(() => {
    if (selectedClass) {
      //fetch quarters only when class changes
      fetch(`/quarters/${selectedClass}`)
        .then((response) => response.json())
        .then((data) => {
          setFilteredQuarters(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [selectedClass]);

  const handleClassSelect = (event, newValue) => {
    setSelectedClass(newValue);
    setFilteredQuarters(quarterList);
    console.log("Selected Class:", newValue);

    // fetch instructors for the selected class
    if (newValue) {
      fetch(`${route}instructors/${newValue}`)
        .then((response) => response.json())
        .then((data) => {
          setInstructorsList(data);
          setFilteredInstructors(data);
          console.log("Instructors1:", filteredInstructors);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      //fetch grade distribution for the selected class
      fetch(
        `${route}grade-distribution/${newValue}?instructor=${instructor}&term=${term}`
      )
        .then((response) => response.json())
        .then((data) => {
          setClassInfo(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  const handleTermSelect = (event) => {
    const selectedTerm = event.target.value;
    setTerm(selectedTerm);

    if (selectedTerm !== "All") {
      //fetch instructors for the selected quarter
      fetch(`/instructors/${selectedClass}/${selectedTerm}`)
        .then((response) => response.json())
        .then((data) => {
          setFilteredInstructors(data);
          console.log("Instructors:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      //filter available quarters based on term
      setFilteredQuarters(filteredQuarters);
      console.log("Filtered Quarters:", filteredQuarters);
    } else {
      // wen All Quarters" is selected, filter quarters based on all quarters for the class
      fetch(`/quarters/All/${selectedClass}`)
        .then((response) => response.json())
        .then((data) => {
          setFilteredQuarters(filteredQuarters);
          setFilteredInstructors(instructorsList);
          console.log("Filtered Quarters 2 side:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  const handleInstructorSelect = (event) => {
    const selectedInstructor = event.target.value;
    setInstructor(selectedInstructor);

    if (selectedInstructor !== "All") {
      //fetch quarters for the selected instructor
      fetch(`/quarters/${selectedClass}/${selectedInstructor}`)
        .then((response) => response.json())
        .then((data) => {
          setFilteredQuarters(data);
          console.log("Filtered Quarters Inst side:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      //when "All Instructors" is selected, filter quarters based on all instructors for the class
      fetch(`/quarters/${selectedClass}`)
        .then((response) => response.json())
        .then((data) => {
          setFilteredQuarters(data);
          setFilteredInstructors(instructorsList);
          console.log("Filtered Quarters 1 side:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  //if All Instructors selected then query for all quarters with X instructor
  //if All Quarters selected then query for all instructors
  //if both selected then query for all quarters with X instructor
  //if a quarter is selected, then query for all instructors in that quarter
  //if an instructor is selected, then query for all quarters with that instructor

  //problems:
  //instructor and quarter selected, changing instructor should change quarter to ALL if ther is no data for that instructor in that quarter
  //if all insturctors is selected, then filtered quarter list should be all quarters
  //if a quarter is selected, filter the instructors list to only show instructors that taught in that quarter

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

  //calculate the total number of students
  const totalStudents = Object.values(classInfo).reduce(
    (acc, val) => acc + val,
    0
  );

  //calculate the percentage values for each grade
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
        //increase size
        text: `Average GPA: ${averageGPA}`,
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
      {/* <h1>Class Information</h1> */}
      <div>
        {/* Autocomplete for Class Selection */}
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
              InputLabelProps={{
                style: { color: "gray" }, // Set label color to gray
              }}
            />
          )}
        />

        <div className="container"></div>

        <TextField
          select
          label="Instructor"
          value={instructor}
          onChange={handleInstructorSelect}
          variant="outlined"
          className="instructor-select-field"
          InputLabelProps={{
            style: { color: "gray" }, // Consistent label color
          }}
        >
          <MenuItem value="All">All Instructors</MenuItem>
          {filteredInstructors.map((instructor) => (
            <MenuItem key={instructor} value={instructor}>
              {instructor}
            </MenuItem>
          ))}
        </TextField>

        <div className="container"></div>

        <TextField
          select
          label="Term"
          value={term}
          onChange={handleTermSelect}
          variant="outlined"
          className="term-select-field"
          InputLabelProps={{
            style: { color: "gray" }, // Consistent label color
          }}
        >
          <MenuItem value="All">All Quarters</MenuItem>
          {filteredQuarters.map((quarter) => (
            <MenuItem key={quarter} value={quarter}>
              {quarter}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          color="primary"
          style={{
            ...showPercentageButtonStyle,
          }}
          onClick={() => setShowPercentage((prev) => !prev)}
          className="percentage-select-field"
        >
          {showPercentage ? "Show Raw Data" : "Show Percentage"}
        </Button>
      </div>
      <Paper className={classes.chart}>
        <div className="chart-container">
          <Bar
            style={{ width: "100%", height: "auto" }} // responsive chart
            data={chartData}
            options={chartOptions}
          />
        </div>
      </Paper>
    </div>
  );
};

export default HomePage;
