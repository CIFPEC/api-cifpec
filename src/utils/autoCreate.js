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
    { courseName: "Diploma Teknologi Komputer (Sistem)" },
    { courseName: "Diploma Teknologi Mekatronik" },
    { courseName: "Diploma Teknologi Telekomunikasi" },
    { courseName: "Diploma Teknologi Automotif Servis" },
    { courseName: "Diploma Teknologi Pembuatan (Perkakasan-Dai)" },
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