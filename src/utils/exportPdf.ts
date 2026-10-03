import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Group, Task } from '../types';

export function generateAcademicPdfReport(group: Group, tasks: Task[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // KOP SURAT ACADEMIC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(12);
  doc.text('FAKULTAS ILMU KOMPUTER - PROGRAM STUDI TEKNIK INFORMATIKA', pageWidth / 2, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Sistem Informasi Pembagian dan Monitoring Tugas Kelompok (SIM-TUGAS)', pageWidth / 2, 27, { align: 'center' });

  // Garis Pembatas Kop Surat
  doc.setLineWidth(0.8);
  doc.line(14, 30, pageWidth - 14, 30);
  doc.setLineWidth(0.3);
  doc.line(14, 31.5, pageWidth - 14, 31.5);

  // JUDUL LAPORAN
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('LAPORAN DISTRIBUSI DAN PROGRES TUGAS KELOMPOK', pageWidth / 2, 39, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Kode Kelompok: ${group.code} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 44, { align: 'center' });

  // INFORMASI KELOMPOK
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('1. INFORMASI KELOMPOK DAN MATA KULIAH', 14, 52);
  doc.setFont('helvetica', 'normal');

  const metaData = [
    ['Nama Kelompok', `: ${group.name}`, 'Mata Kuliah', `: ${group.courseName}`],
    ['Kelas / Semester', `: ${group.classSection}`, 'Dosen Pengampu', `: ${group.lecturerName}`],
    ['Deskripsi Proyek', `: ${group.description}`, 'NIP Dosen', `: ${group.lecturerNip}`]
  ];

  let currentY = 56;
  metaData.forEach(row => {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], 46, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text(row[2], 115, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(row[3], 148, currentY);
    currentY += 5;
  });

  // TABEL 1: ANGGOTA & KONTRIBUSI
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('2. REKAPITULASI KONTRIBUSI ANGGOTA KELOMPOK', 14, currentY);
  currentY += 3;

  // Hitung kontribusi per anggota
  const memberStats = group.members.map((m, idx) => {
    const assignedTasks = tasks.filter(t => t.assignedTo.includes(m.userId));
    const completedTasks = assignedTasks.filter(t => t.status === 'DONE');
    const totalWeight = assignedTasks.reduce((acc, t) => acc + (t.weight || 0), 0);
    const completedWeight = completedTasks.reduce((acc, t) => acc + (t.weight || 0), 0);
    const progressPercent = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

    return [
      (idx + 1).toString(),
      m.nim,
      m.name,
      m.role === 'KETUA' ? 'Ketua Kelompok' : 'Anggota',
      m.specialization || '-',
      `${assignedTasks.length} Tugas`,
      `${totalWeight}%`,
      `${progressPercent}% Selesai`
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'NIM', 'Nama Mahasiswa', 'Peran', 'Fokus Peran', 'Jml Tugas', 'Beban', 'Progres']],
    body: memberStats,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 24 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25 },
      4: { cellWidth: 35 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 15 },
      7: { halign: 'center', cellWidth: 20 }
    }
  });

  // TABEL 2: RINCIAN SEMUA TUGAS
  const finalYTable1 = (doc as any).lastAutoTable.finalY || 120;
  let nextY = finalYTable1 + 8;

  if (nextY > 230) {
    doc.addPage();
    nextY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('3. MATRIKS RINCIAN DISTRIBUSI DAN STATUS TUGAS', 14, nextY);
  nextY += 3;

  const taskRows = tasks.map((t, i) => {
    let statusLabel = 'Belum Dimulai';
    if (t.status === 'IN_PROGRESS') statusLabel = 'Sedang Dikerjakan';
    if (t.status === 'IN_REVIEW') statusLabel = 'Menunggu Review';
    if (t.status === 'REVISION') statusLabel = 'Perlu Revisi';
    if (t.status === 'DONE') statusLabel = 'Selesai';

    return [
      (i + 1).toString(),
      t.title,
      t.assignedNames.join(', '),
      `${t.weight}%`,
      t.dueDate,
      statusLabel,
      t.score ? `${t.score}/100` : '-'
    ];
  });

  autoTable(doc, {
    startY: nextY,
    head: [['No', 'Deskripsi / Nama Tugas', 'Penanggung Jawab (PIC)', 'Bobot', 'Deadline', 'Status Saat Ini', 'Nilai Dosen']],
    body: taskRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 55 },
      2: { cellWidth: 42 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 22 },
      5: { halign: 'center', cellWidth: 30 },
      6: { halign: 'center', cellWidth: 18 }
    }
  });

  // EVALUASI & TANDA TANGAN
  const finalYTable2 = (doc as any).lastAutoTable.finalY || 200;
  let signY = finalYTable2 + 10;

  if (signY > 235) {
    doc.addPage();
    signY = 30;
  }

  // Ringkasan Evaluasi Dosen jika ada
  if (group.evaluation) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Catatan Evaluasi Dosen (Nilai Akhir Kelompok: ${group.evaluation.score}/100):`, 14, signY);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(`"${group.evaluation.notes}"`, 14, signY + 5);
    signY += 14;
  }

  // Kolom Tanda Tangan
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Mengetahui,', 25, signY);
  doc.text('Ketua Kelompok,', 25, signY + 5);

  doc.text('Disetujui oleh,', pageWidth - 70, signY);
  doc.text('Dosen Pengampu Mata Kuliah,', pageWidth - 70, signY + 5);

  const signSpaceY = signY + 24;

  const leader = group.members.find(m => m.role === 'KETUA') || group.members[0];
  doc.setFont('helvetica', 'bold');
  doc.text(leader ? leader.name : 'Ketua Kelompok', 25, signSpaceY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIM. ${leader ? leader.nim : '-'}`, 25, signSpaceY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(group.lecturerName, pageWidth - 70, signSpaceY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. ${group.lecturerNip}`, pageWidth - 70, signSpaceY + 4);

  // Trigger Save
  doc.save(`Laporan_SIM_Tugas_${group.code}_${new Date().toISOString().split('T')[0]}.pdf`);
}
