import { Group, Task } from '../types';

export function generateCsvExcelReport(group: Group, tasks: Task[]): void {
  const headers = [
    'No',
    'ID Tugas',
    'Judul Tugas',
    'Penanggung Jawab (PIC)',
    'Status',
    'Prioritas',
    'Bobot (%)',
    'Deadline Tanggal',
    'Deadline Jam',
    'Total Subtask',
    'Subtask Selesai',
    'Jumlah Lampiran / Berkas',
    'Ada Revisi',
    'Nilai Dosen',
    'Feedback Dosen',
    'Deskripsi Tugas'
  ];

  const rows = tasks.map((task, idx) => {
    let statusText = 'Belum Dimulai';
    if (task.status === 'IN_PROGRESS') statusText = 'Sedang Dikerjakan';
    if (task.status === 'IN_REVIEW') statusText = 'Menunggu Review';
    if (task.status === 'REVISION') statusText = 'Perlu Revisi';
    if (task.status === 'DONE') statusText = 'Selesai';

    const completedSub = task.subtasks.filter(s => s.completed).length;
    const hasPendingRevision = task.revisions.some(r => !r.resolved) ? 'Ya (Belum Selesai)' : task.revisions.length > 0 ? 'Pernah Direvisi' : 'Tidak';

    return [
      idx + 1,
      task.id,
      `"${(task.title || '').replace(/"/g, '""')}"`,
      `"${task.assignedNames.join('; ')}"`,
      statusText,
      task.priority,
      task.weight || 0,
      task.dueDate,
      task.dueTime || '-',
      task.subtasks.length,
      completedSub,
      task.attachments.length,
      hasPendingRevision,
      task.score || '-',
      `"${(task.lecturerFeedback || '').replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ];
  });

  // Header info rows
  const metaRows = [
    ['SISTEM INFORMASI PEMBAGIAN DAN MONITORING TUGAS KELOMPOK (SIM-TUGAS)'],
    [`Nama Kelompok: ${group.name}`],
    [`Kode Kelompok: ${group.code}`],
    [`Mata Kuliah: ${group.courseName} (${group.classSection})`],
    [`Dosen Pengampu: ${group.lecturerName}`],
    [`Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`],
    [] // blank row
  ];

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Microsoft Excel
    metaRows.map(r => r.join(';')).join('\n') + '\n' +
    headers.join(';') + '\n' +
    rows.map(r => r.join(';')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Tugas_${group.code}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
