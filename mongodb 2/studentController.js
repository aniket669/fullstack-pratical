const req = require("express/lib/request");
const Student = require("../models/Student");

exports.createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
    
        const data = student.toObject();
    
        res.status(201).json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id, "name age course");
        if (!student) return res.status(404).json({ error: "Student not found" });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            fields: "name age course"
        });
        if(!updated){
            res.status(404).json({ error: "Student not found" });
        };
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const deleted = await Student.findOneAndDelete(req.params.id);
        if(!deleted) res.status(404).json({ error: "Student not found"});
        const data = deleted.toObject();
        delete data._id;

        res.json({ message: "Student deleted", student: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};