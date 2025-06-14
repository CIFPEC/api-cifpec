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
  ]
}

export function Create_Categories() {
  return [
    { categoryName: "Teknologi Maklumat", categoryCode: "TMK" },
    { categoryName: "Elektrik dan Elektronik", categoryCode: "ELK" },
    { categoryName: "Mekanikal", categoryCode: "MEK" },
  ]
}

export function Create_DataSite() {
  return { 
      title: "My Portal",
      textHeader: "Welcome to my portal",
      description: "You can see many reference project here, we provide all PTA project here..."
  }
}