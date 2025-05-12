export function Create_Roles() {
  return [
    { roleName: "admin" },
    { roleName: "web maintenance" },
    { roleName: "coordinator" },
    { roleName: "supervisor" },
    { roleName: "student" },
  ]
}

export function Create_Courses() {
  return [
    { courseName: "Web Development" },
    { courseName: "Mobile Development" },
    { courseName: "Game Development" },
    { courseName: "UI/UX Design" },
    { courseName: "Data Science" },
    { courseName: "Machine Learning" },
  ]
}

export function Create_DataSite() {
  return { 
      title: "My Portal",
      textHeader: "Welcome to my portal",
      description: "You can see many reference project here, we provide all PTA project here..."
  }
}