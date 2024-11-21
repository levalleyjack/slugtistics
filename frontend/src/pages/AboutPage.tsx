import React from 'react';

const AboutPage = () => {
  return (
    <div className="container">
      <div style={{ 
        maxWidth: '80vw', 
        margin: '1rem auto', 
      }}>
        <h1 className="text-3xl font-bold mb-4">About Slugtistics</h1>
        <hr className="mb-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What is Slugtistics?</h2>
          <p className="mb-4">
            Slugtistics is an application designed to provide students and educators with valuable insights into class data, grade distributions, and instructor information. This webpage aims to assist students in making informed decisions about their course selections to help organize their courseloads and maximize their success. Slugtistics is a free and open source project that is not affiliated with the University of California, Santa Cruz. Slugtistics is a project created by UCSC students for UCSC students.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How did you get the data?</h2>
          <p className="mb-4">
            Slugtistic's data was obtained through the California Public Records Act (CPRA) to access grade distribution information from UCSC. The data obtained from the CPRA was then processed and stored in a database to be used by this application.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2x1 font-semibold mb-4">How far does the data go back?</h2>
          <p className="mb-4">
            The data goes back to Fall 2019. Getting this data costs money, but if the desire is large enough I will get earlier data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Any other questions?</h2>
          <p className="mb-2">Contact Us:</p>
          <p className="mb-2">
            My name is <b><a href="https://www.linkedin.com/in/jack-levalley/" className="text-blue-600 hover:text-blue-800">Jack LeValley</a></b>, message me on Discord at: <b>eggw</b>
          </p>
          <p className="mb-2">
            Contributions from <b><a href="https://www.linkedin.com/in/qaysbadri/" className="text-blue-600 hover:text-blue-800">Qays Badri</a></b>
          </p>
          <p className="mb-2">
            GE Search by <b><a href="https://www.linkedin.com/in/ashwinsm10/" className="text-blue-600 hover:text-blue-800">Ashwin Murthy</a></b>          </p>
          <p className="mb-2">
            <b><a href="https://github.com/levalleyjack/slugtistics" className="text-blue-600 hover:text-blue-800">Github</a></b>
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;