const AboutPage = () => {
  return (
    <>
      <div id="page-body">
        <h1>About Slugtistics</h1>
        <hr></hr>
        <h2>What is Slugtistics?</h2>
        <p>
          Slugtistics is an application designed to provide students and
          educators with valuable insights into class data, grade distributions,
          and instructor information. This webpage aims to assist students in
          making informed decisions about their course selections to help
          organize their courseloads and maximize their success. Slugtistics is
          a free and open source project that is not affiliated with the
          University of California, Santa Cruz. Slugtistics is a project created
          by UCSC students for UCSC students.
        </p>
        <h2>How did you get the data?</h2>
        <p>
          Slugtistic's data was obtained through the California Public Records
          Act (CPRA) to access grade distribution information from UCSC. The
          data obtained from the CPRA was then processed and stored in a
          database to be used by this application.
        </p>
        <h2>How far does the data go back?</h2>
        <p>Slugtistic's data is only Spring 2022, I am currently working with the respective offices to obtain data all the way back to Fall 2014</p>
        <h2>Any other questions?</h2>
        <p>Contact Us:</p>
        <p>
          Message me on discord at: <b>eggw</b>
        </p>
        <p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSf1UKTZqwYLbhSL1T5LI117XQlVpJi93RPHGjNtDrOstTgs6A/viewform?usp=sf_link">Feedback Form</a>
        </p>
      </div>
    </>
  );
};

export default AboutPage;
