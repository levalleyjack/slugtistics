//==========================================================================================================//
//imports
import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { ChartOptions } from "chart.js/auto";
import { _DeepPartialObject } from "chart.js/dist/types/utils";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { styled } from "@mui/material";


const OuterContainer = styled('div')(({ theme }) => ({
  width: '80vw',
  margin: '0 auto',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
  },
}));

const Container = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ChartContainer = styled('div')({
  position: 'relative',
  cursor: 'default',
  height: '550px',
});
//==========================================================================================================//
//homepage function and state declarations
//this is the main page of the website

const HomePage = () => {
  const [classTitles, setClassTitles] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [instructorsList, setInstructorsList] = useState([]);
  const [instructor, setInstructor] = useState("All");
  const [term, setTerm] = useState("All");
  const [classInfo, setClassInfo] = useState([]);
  const [showPercentage, setShowPercentage] = useState(false);
  const [filteredQuarters, setFilteredQuarters] = useState<string[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

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

  const route = "https://api.slugtistics.com/api/";
  // const route = "http://localhost:8080/";

  
  //URL parameters load
  useEffect(() => {
    const initialClass = params.get("class") || "";
    const initialInstructor = params.get("instructor") || "All";
    const initialTerm = params.get("term") || "All";
  
    setSelectedClass(initialClass);
    setInstructor(initialInstructor);
    setTerm(initialTerm);

    fetch(`${route}instructors/${selectedClass}&term=${term}`)
    .then((response) => response.json())
    .then((data) => {
      setFilteredInstructors(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  }, []);
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
      fetch(`${route}quarters/${selectedClass}`)
        .then((response) => response.json())
        .then((data) => {
          setFilteredQuarters(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [selectedClass]);


  useEffect(() => {
    if (selectedClass) {
      //fetch instructors when class changes
      fetch(`${route}instructors/${selectedClass}`)
        .then((response) => response.json())
        .then((data) => {
          setFilteredInstructors(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [selectedClass]);


  const handleClassSelect = (event: any, newValue: string | null) => {
    setSelectedClass(newValue ?? "");
    setFilteredQuarters(quarterList);
    setTerm("All");
    setInstructor("All");
  
    // Fetch instructors for the selected class
    if (newValue) {
      fetch(`${route}instructors/${newValue}`)
        .then((response) => response.json())
        .then((data) => {
          setInstructorsList(data);
          setFilteredInstructors(data);
          // Check if instructor from URL is in the fetched list; if not, set to "All"
          const urlInstructor = params.get("instructor") || "All";
          if (urlInstructor === "All" || data.includes(urlInstructor)) {
            setInstructor(urlInstructor);
          } else {
            setInstructor("All");
          }
        })
        .catch((error) => console.error("Error:", error));
  
      // Fetch grade distribution for the selected class
      fetch(`${route}grade-distribution/${newValue}?instructor=${instructor}&term=${term}`)
        .then((response) => response.json())
        .then((data) => setClassInfo(data))
        .catch((error) => console.error("Error:", error));
    }
  };

const handleTermSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
  const selectedTerm = event.target.value as string;
  setTerm(selectedTerm);

  if (selectedTerm !== "All") {
    fetch(`${route}instructors/${selectedClass}/${selectedTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setFilteredInstructors(data);
        const urlInstructor = params.get("instructor") || "All";
        if (urlInstructor === "All" || data.includes(urlInstructor)) {
          setInstructor(urlInstructor);
        } else {
          setInstructor("All");
        }
      })
      .catch((error) => console.error("Error:", error));
  } else {
    setFilteredInstructors(instructorsList);
  }
};

  const handleInstructorSelect = (event: { target: { value: any; }; }) => {
    const selectedInstructor = event.target.value;
    setInstructor(selectedInstructor);

    if (selectedInstructor !== "All") {
      fetch(`${route}quarters/${selectedClass}/${selectedInstructor}`)
        .then((response) => response.json())
        .then((data) => {
          setFilteredQuarters(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      fetch(`${route}quarters/${selectedClass}`)
        .then((response) => response.json())
        .then((data) => {
          setFilteredQuarters(data);
          setFilteredInstructors(instructorsList);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };
  
    // //Update URL parameters when dropdown selections change
    // useEffect(() => {
    //   const searchParams = new URLSearchParams();
    //   if (selectedClass) searchParams.append("class", selectedClass);
    //   if (instructor !== "All") searchParams.append("instructor", instructor);
    //   if (term !== "All") searchParams.append("term", term);
  
    //   navigate({ search: searchParams.toString() });
    // }, [selectedClass, instructor, term, navigate]);

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

  const calculateGPA = (grade: string) => {
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
  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: string | number) {
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


  const showPercentageButtonStyle = {
    backgroundColor: "#111827",
    margin: "0.5rem",
  };

  //==========================================================================================================//
  //return statement
  return (
    <OuterContainer>
      <Container>
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
                InputLabelProps={{
                  style: { color: "gray" },
                }}
              />
            )}
          />

          <div className="filters-container">
            <TextField
              select
              label="Instructor"
              value={instructor}
              onChange={handleInstructorSelect}
              variant="outlined"
              className="instructor-select-field"
              InputLabelProps={{ style: { color: "gray" } }}
            >
              <MenuItem value="All">All Instructors</MenuItem>
              {filteredInstructors.map((instructor) => (
                <MenuItem key={instructor} value={instructor}>
                  {instructor}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Term"
              value={term}
              onChange={handleTermSelect}
              variant="outlined"
              className="term-select-field"
              InputLabelProps={{ style: { color: "gray" } }}
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
              style={{ ...showPercentageButtonStyle }}
              onClick={() => setShowPercentage((prev) => !prev)}
              className="percentage-select-field"
            >
              {showPercentage ? "Show Raw Data" : "Show Percentage"}
            </Button>
          </div>
        </div>
        <StyledPaper>
          <ChartContainer>
            <Bar
              className="chart"
              data={chartData}
              options={chartOptions}
            />
          </ChartContainer>
        </StyledPaper>
      </Container>
    </OuterContainer>
  );
};
export default HomePage;
