// Generate time options for select dropdowns (00:00 to 23:30 in 30-minute increments)
export const timeOptions: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = h.toString().padStart(2, '0');
    const minute = m.toString().padStart(2, '0');
    timeOptions.push(`${hour}:${minute}`);
  }
}

/**
 * Calculate hours from time slots
 * @param slot1Start - Start time of first slot (HH:MM)
 * @param slot1End - End time of first slot (HH:MM)
 * @param slot2Start - Start time of second slot (HH:MM) - optional
 * @param slot2End - End time of second slot (HH:MM) - optional
 * @returns Total hours as a decimal number
 */
export const calculateHours = (
  slot1Start?: string,
  slot1End?: string,
  slot2Start?: string,
  slot2End?: string
): number => {
  let totalMinutes = 0;

  // Calculate first slot
  if (slot1Start && slot1End) {
    const [h1, m1] = slot1Start.split(':').map(Number);
    const [h2, m2] = slot1End.split(':').map(Number);
    const start1 = h1 * 60 + m1;
    const end1 = h2 * 60 + m2;
    if (end1 > start1) {
      totalMinutes += end1 - start1;
    }
  }

  // Calculate second slot (optional)
  if (slot2Start && slot2End) {
    const [h3, m3] = slot2Start.split(':').map(Number);
    const [h4, m4] = slot2End.split(':').map(Number);
    const start2 = h3 * 60 + m3;
    const end2 = h4 * 60 + m4;
    if (end2 > start2) {
      totalMinutes += end2 - start2;
    }
  }

  // Convert to hours with 2 decimal places
  return Math.round((totalMinutes / 60) * 100) / 100;
};

export const formatDuration = (totalMinutes: number): string => {
  return `${totalMinutes} min`;
};

export const formatMaterialName = (material: any): string => {
  return material?.description || 'Materiale non specificato';
};

export const formatTimeSlot = (startTime: string, endTime?: string): string => {
  if (!startTime || !endTime) return '--:--';
  return `${startTime} - ${endTime}`;
};

export const formatTimeSlots = (slot1_start: string, slot1_end: string, slot2_start?: string, slot2_end?: string): string => {
  const time1 = formatTimeSlot(slot1_start, slot1_end);
  const time2 = slot2_start && slot2_end ? formatTimeSlot(slot2_start, slot2_end) : '';
  return time2 ? `${time1} (pausa) ${time2}` : time1;
};

export const calculateTotalHours = (entries: Array<{ total_hours?: number } | undefined>): number => {
  if (!entries || entries.length === 0) return 0;
  const total = entries.reduce((sum: number, entry: any) => sum + (Number(entry?.total_hours) || 0), 0);
  return total;
};
