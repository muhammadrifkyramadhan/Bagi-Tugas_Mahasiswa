import { Task, Group } from '../types';

export function getGoogleCalendarUrl(task: Task, group?: Group): string {
  // Format dates: YYYYMMDDTHHmmssZ
  let startDateTimeStr = task.dueDate;
  if (task.dueTime) {
    startDateTimeStr += `T${task.dueTime}:00`;
  } else {
    startDateTimeStr += `T23:59:00`;
  }

  const d = new Date(startDateTimeStr);
  // Default to 1 hour event ending at due date
  const end = new Date(d.getTime() + 60 * 60 * 1000);

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const title = encodeURIComponent(`[Deadline Tugas] ${task.title} - ${group?.code || 'SIM-Tugas'}`);
  const details = encodeURIComponent(
    `Tugas: ${task.title}\n` +
    `Mata Kuliah: ${group?.courseName || '-'}\n` +
    `Penanggung Jawab: ${task.assignedNames.join(', ')}\n` +
    `Prioritas: ${task.priority}\n` +
    `Bobot: ${task.weight}%\n\n` +
    `Deskripsi:\n${task.description}\n\n` +
    `Akses SIM-Tugas untuk update progres dan lampiran.`
  );
  const location = encodeURIComponent(`${group?.courseName || 'Kampus'} - ${group?.name || 'Kelompok'}`);

  const datesParam = `${formatGoogleDate(d)}/${formatGoogleDate(end)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
}

export function downloadIcsFile(task: Task, group?: Group): void {
  let startDateTimeStr = task.dueDate;
  if (task.dueTime) {
    startDateTimeStr += `T${task.dueTime}:00`;
  } else {
    startDateTimeStr += `T23:59:00`;
  }

  const startDate = new Date(startDateTimeStr);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatIcsDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SIM-Tugas Mahasiswa//NONSGML v1.0//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:sim-tugas-${task.id}@universitas.ac.id`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:[Deadline] ${task.title.replace(/\n/g, ' ')} (${group?.code || 'Kelompok'})`,
    `DESCRIPTION:${(task.description || '').replace(/\n/g, '\\n')}\\nPIC: ${task.assignedNames.join(', ')}`,
    `LOCATION:${group?.courseName || 'Kampus'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Pengingat Deadline Tugas 24 Jam Lagi',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Deadline_${task.title.substring(0, 20).replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
