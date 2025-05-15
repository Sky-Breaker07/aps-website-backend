const mongoose = require("mongoose");

// Schema for role permissions
const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

// Schema for storing role assignments by academic session
const roleAssignmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    matricNumber: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    academicSession: {
      type: String,
      required: true,
      trim: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    handoverDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

// Main Role Schema
const RoleSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Executive", "Senate", "ClassRep"],
    required: true,
  },
  office: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    enum: ["100", "200", "300", "400", "500", "All"],
    required: function () {
      // Level is required for ClassRep and some Senate roles
      return this.category === "ClassRep" || this.category === "Senate";
    },
    default: function () {
      return this.category === "Executive" ? "All" : null;
    },
  },
  // Array of permissions specific to this role
  permissions: [permissionSchema],
  // History of students who held this role across academic sessions
  assignmentHistory: [roleAssignmentSchema],
  // Current student assigned to this role
  currentAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: null,
  },
  currentAcademicSession: {
    type: String,
    default: null,
    trim: true,
  },
  restrictions: {
    type: [String],
    enum: ["Executive", "Senate", "ClassRep"],
    default: function () {
      // By default, Executive and Senate roles are mutually exclusive
      if (this.category === "Executive") return ["Senate"];
      if (this.category === "Senate") return ["Executive"];
      return [];
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-defined Executive Offices
const executiveOffices = [
  "President",
  "Vice President",
  "General Secretary",
  "Assistant General Secretary",
  "Financial Secretary",
  "Treasurer",
  "Public Relations Officer",
  "Sports Secretary",
  "Social Secretary",
  "Special Duties Officer",
];

// Pre-defined Senate Offices
const senateOffices = [
  "Senate President",
  "Deputy Senate President",
  "Clerk",
  "Chief Whip",
  "Senator",
];

// Pre-defined Class Rep Offices
const classRepOffices = [
  "Class Representative",
  "Assistant Class Representative (Academic)",
  "Assistant Class Representative (Admin)",
];

// Static method to initialize default roles
RoleSchema.statics.initializeDefaultRoles = async function () {
  const Role = this;

  // Create Executive roles
  for (const office of executiveOffices) {
    const exists = await Role.findOne({ category: "Executive", office });
    if (!exists) {
      await Role.create({
        category: "Executive",
        office,
        level: "All",
        permissions: [],
      });
    }
  }

  // Create Senate roles
  for (const office of senateOffices) {
    // For regular senators, create 3 for each level
    if (office === "Senator") {
      for (const level of ["100", "200", "300", "400", "500"]) {
        for (let i = 1; i <= 3; i++) {
          const senatorTitle = `${level}L Senator ${i}`;
          const exists = await Role.findOne({
            category: "Senate",
            office: senatorTitle,
            level,
          });
          if (!exists) {
            await Role.create({
              category: "Senate",
              office: senatorTitle,
              level,
              permissions: [],
            });
          }
        }
      }
    } else {
      // Create principal senate offices
      const exists = await Role.findOne({ category: "Senate", office });
      if (!exists) {
        await Role.create({
          category: "Senate",
          office,
          level: "All",
          permissions: [],
        });
      }
    }
  }

  // Create Class Rep roles for each level
  for (const level of ["100", "200", "300", "400", "500"]) {
    for (const office of classRepOffices) {
      const exists = await Role.findOne({
        category: "ClassRep",
        office,
        level,
      });
      if (!exists) {
        await Role.create({
          category: "ClassRep",
          office,
          level,
          permissions: [],
        });
      }
    }
  }
};

// Updates the timestamp before saving
RoleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to assign a student to a role
RoleSchema.methods.assignStudent = async function (student, academicSession) {
  // Check if the student already has a conflicting role
  if (this.restrictions.length > 0) {
    // Check for conflicting roles based on restrictions
    for (const restrictedCategory of this.restrictions) {
      const hasConflictingRole = await mongoose.model("Role").findOne({
        category: restrictedCategory,
        "assignmentHistory.studentId": student._id,
        "assignmentHistory.academicSession": academicSession,
        "assignmentHistory.isActive": true,
      });

      if (hasConflictingRole) {
        throw new Error(
          `Student cannot be assigned to this role because they already have a ${restrictedCategory} role`
        );
      }
    }
  }

  // If current assignment exists, mark it as inactive
  if (this.currentAssignment) {
    for (const assignment of this.assignmentHistory) {
      if (
        assignment.studentId.equals(this.currentAssignment) &&
        assignment.academicSession === this.currentAcademicSession &&
        assignment.isActive
      ) {
        assignment.isActive = false;
        assignment.handoverDate = Date.now();
      }
    }
  }

  // Create new assignment
  this.assignmentHistory.push({
    studentId: student._id,
    matricNumber: student.matricNumber,
    fullName: `${student.firstName} ${student.lastName}`,
    academicSession,
    assignedDate: Date.now(),
    isActive: true,
  });

  // Update current assignment
  this.currentAssignment = student._id;
  this.currentAcademicSession = academicSession;

  // Update student model to reflect role
  const Student = mongoose.model("Student");
  await Student.findByIdAndUpdate(student._id, {
    $push: {
      post: { title: `${this.category} - ${this.office}`, academicSession },
    },
    isExecutive: this.category === "Executive" ? true : undefined,
    isSenator: this.category === "Senate" ? true : undefined,
  });

  return this.save();
};

// Method to remove a student from a role
RoleSchema.methods.removeStudent = async function (studentId, academicSession) {
  // Find the assignment
  let found = false;
  for (const assignment of this.assignmentHistory) {
    if (
      assignment.studentId.equals(studentId) &&
      assignment.academicSession === academicSession &&
      assignment.isActive
    ) {
      assignment.isActive = false;
      assignment.handoverDate = Date.now();
      found = true;
    }
  }

  if (!found) {
    throw new Error(
      "No active assignment found for this student and academic session"
    );
  }

  // Update current assignment if this was the current one
  if (
    this.currentAssignment &&
    this.currentAssignment.equals(studentId) &&
    this.currentAcademicSession === academicSession
  ) {
    this.currentAssignment = null;
    this.currentAcademicSession = null;
  }

  // Update student model if needed
  const Student = mongoose.model("Student");
  const student = await Student.findById(studentId);

  if (student) {
    // Remove the specific post
    const updatedPosts = student.post.filter(
      (p) =>
        !(
          p.title === `${this.category} - ${this.office}` &&
          p.academicSession === academicSession
        )
    );
    student.post = updatedPosts;

    // Check if student still has any roles in the category
    const stillHasRoles = await mongoose.model("Role").findOne({
      category: this.category,
      "assignmentHistory.studentId": studentId,
      "assignmentHistory.isActive": true,
    });

    // Update role flags if needed
    if (!stillHasRoles) {
      if (this.category === "Executive") {
        student.isExecutive = false;
      } else if (this.category === "Senate") {
        student.isSenator = false;
      }
    }

    await student.save();
  }

  return this.save();
};

module.exports = mongoose.model("Role", RoleSchema);
