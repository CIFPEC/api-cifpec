export function generateCategoryCode(courseName) {
  const cleanedName = courseName.replace(/[^A-Za-z\s\(\)]/g, '');
  const words = cleanedName.split(' ').filter(Boolean);
  let code = words.map(w => w[0]).join('').toUpperCase().slice(0, 3);

  const bracketMatch = courseName.match(/\(([^)]+)\)/);
  if (bracketMatch) {
    const bracket = bracketMatch[1].replace(/[^A-Za-z]/g, '');
    code += bracket.slice(0, 2).toUpperCase(); // ambil max 2 huruf dari dalam bracket
  }

  return code;
}
