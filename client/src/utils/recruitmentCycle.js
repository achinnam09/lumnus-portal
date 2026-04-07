export function getCurrentRecruitmentCycle() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const season = month >= 8 && month <= 10 ? "Fall" : "Spring";
  return `${season}-${year}`;
}
