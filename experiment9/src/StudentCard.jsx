function StudentCard({ student }) {
    return (
      <div className="card">
        <h3>Student</h3>
        <p><b>Name:</b> {student.name}</p>
        <p><b>Age:</b> {student.age}</p>
        <p><b>Roll No:</b> {student.rollNo}</p>
        <p><b>Course:</b> {student.course}</p>
      </div>
    );
  }
  export default StudentCard;
