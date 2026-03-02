export const formatDuration = (totalMinutes: number): string => {
  return `${totalMinutes} min`;
};

export const formatMaterialName = (material: string): string => {
  return material.description || 'Materiale non specificato';
};

export const formatTimeSlot = (startTime: string, endTime?: string): string => {
  if (!startTime || !endTime) return '--:--';
  const start = new Date(startTime);
  const end = new Date(endTime);
  return `${start.toLocaleTimeString('it-IT')} - ${end.toLocaleTimeString('it-IT')}`;
};

export const formatTimeSlots = (slot1_start: string, slot1_end: string, slot2_start?: string, slot2_end?: string): string => {
  const time1 = formatTimeSlot(slot1_start, slot1_end);
  const time2 = slot2_start && slot2_end ? formatTimeSlot(slot2_start, slot2_end) : '';
  return time2 ? `${time1} (pausa) ${time2}` : time1;
};

export const calculateTotalHours = (entries: Array<{ total_hours?: number } | undefined>): number => {
  if (!entries || entries.length === 0) return 0;
  const total = entries.reduce((sum: number, entry: any) => sum + (Number(entry.total_hours) || 0), 0);
  return total;
};