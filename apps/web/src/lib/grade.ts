/** Percentage → letter grade + GPA point (a common 4.0-style scale). */
export function grade(pct: number): { letter: string; gpa: number; color: string } {
  if (pct >= 90) return { letter: 'A+', gpa: 4.0, color: 'text-success' };
  if (pct >= 80) return { letter: 'A', gpa: 4.0, color: 'text-success' };
  if (pct >= 70) return { letter: 'B', gpa: 3.0, color: 'text-info' };
  if (pct >= 60) return { letter: 'C', gpa: 2.0, color: 'text-warning' };
  if (pct >= 50) return { letter: 'D', gpa: 1.0, color: 'text-warning' };
  return { letter: 'F', gpa: 0.0, color: 'text-danger' };
}
