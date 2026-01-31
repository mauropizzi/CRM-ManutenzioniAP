export const calculateHours = (
  start1: string, 
  end1: string, 
  start2?: string, 
  end2?: string
): number => {
  let totalMinutes = 0;

  const parseTime = (time: string) => {
    if (!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  if (start1 && end1) {
    const s1 = parseTime(start1);
    const e1 = parseTime(end1);
    if (e1 > s1) totalMinutes += (e1 - s1);
  }

  if (start2 && end2) {
    const s2 = parseTime(start2);
    const e2 = parseTime(end2);
    if (e2 > s2) totalMinutes += (e2 - s2);
  }

  return totalMinutes / 60;
};