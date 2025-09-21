function TeacherCard({ teacher }) {
    return (
      <div className="card">
        <h3>Teacher</h3>
        <p><b>Name:</b> {teacher.name}</p>
        <p><b>Age:</b> {teacher.age}</p>
        <p><b>Subject:</b> {teacher.subject}</p>
        <p><b>Salary:</b> ₹{teacher.salary}</p>
      </div>
    );
  }
  export default TeacherCard;
