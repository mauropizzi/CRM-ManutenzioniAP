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

// Funzione per generare le opzioni dell'ora (ogni 30 minuti)
export const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};