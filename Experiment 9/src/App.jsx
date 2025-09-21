import React from 'react';
import { Person } from './Person';
import StudentCard from './StudentCard';
import TeacherCard from './TeacherCard';

// Student class extending Person
class Student extends Person {
  constructor(name, age, rollNo, course) {
    super(name, age);
    this.rollNo = rollNo;
    this.course = course;
  }
}

// Teacher class extending Person
class Teacher extends Person {
  constructor(name, age, subject, salary) {
    super(name, age);
    this.subject = subject;
    this.salary = salary;
  }
}

function App() {
  // Sample data
  const people = [
    new Student("Aniket", 21, "CS001", "MERN Stack"),
    new Teacher("Mr. Rahul", 35, "Web Dev", 65000),
    new Student("Sneha", 20, "CS002", "Data Science"),
    new Teacher("Ms. Priya", 32, "DBMS", 70000),
  ];

  return (
    <div className="container">
      <h2>Person Hierarchy</h2>
      <div className="grid">
        {people.map((person, i) =>
          person instanceof Student ? (
            <StudentCard key={i} student={person} />
          ) : (
            <TeacherCard key={i} teacher={person} />
          )
        )}
      </div>
    </div>
  );
}

export default App;
