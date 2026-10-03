import JSZip from 'jszip';

// Helper to bundle all project files into a downloadable ZIP for VS Code
export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root config files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: "sim-tugas-mahasiswa",
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview"
        },
        dependencies: {
          "@tailwindcss/vite": "^4.3.3",
          "@vitejs/plugin-react": "^6.1.1",
          "jspdf": "^4.2.1",
          "jspdf-autotable": "^5.0.7",
          "jszip": "^3.10.1",
          "lucide-react": "^0.546.0",
          "motion": "^12.23.24",
          "react": "^19.0.1",
          "react-dom": "^19.0.1",
          "tailwindcss": "^4.3.3",
          "vite": "^8.3.0"
        },
        devDependencies: {
          "@types/node": "^22.14.0",
          "@types/react": "^19.3.0",
          "@types/react-dom": "^19.3.0",
          "typescript": "^5.7.0"
        }
      },
      null,
      2
    )
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          useDefineForClassFields: false,
          module: "ESNext",
          types: ["vite/client"],
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          skipLibCheck: true,
          moduleResolution: "bundler",
          isolatedModules: true,
          moduleDetection: "force",
          allowJs: true,
          jsx: "react-jsx",
          paths: {
            "@/*": ["./src/*"]
          },
          allowImportingTsExtensions: false,
          noEmit: true
        },
        include: ["src"]
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true
  }
});
`
  );

  zip.file(
    'index.html',
    `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SIM-Tugas - Sistem Pembagian & Monitoring Tugas Kelompok Mahasiswa</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  zip.file(
    'README.md',
    `# SIM-TUGAS: Sistem Informasi Pembagian & Monitoring Tugas Kelompok Mahasiswa

Aplikasi berbasis web untuk mengatasi kendala koordinasi tugas kelompok kuliah di WhatsApp, transparansi alokasi beban kerja anggota, deadline otomatis, evaluasi dosen, dan ekspor laporan PDF/Excel.

## 🚀 Cara Menjalankan di Visual Studio Code:

1. Ekstrak file zip ini ke folder komputer Anda (misal \`D:/sim-tugas\`).
2. Buka folder tersebut di **VS Code** (\`File -> Open Folder\`).
3. Buka Terminal di VS Code (\`Ctrl + \`\` atau \`Terminal -> New Terminal\`).
4. Jalankan perintah instalasi dependensi:
   \`\`\`bash
   npm install
   \`\`\`
5. Jalankan server lokal:
   \`\`\`bash
   npm run dev
   \`\`\`
6. Buka browser di \`http://localhost:3000\`.
`
  );

  // Fetch or copy actual project source files
  // Using direct fetch of files from development server
  const sourceFiles = [
    'src/main.tsx',
    'src/App.tsx',
    'src/index.css',
    'src/types/index.ts',
    'src/utils/storage.ts',
    'src/utils/exportPdf.ts',
    'src/utils/exportExcel.ts',
    'src/utils/calendar.ts',
    'src/utils/downloadProjectZip.ts',
    'src/context/ThemeContext.tsx',
    'src/context/AuthContext.tsx',
    'src/context/AppContext.tsx',
    'src/components/Navbar.tsx',
    'src/components/Sidebar.tsx',
    'src/components/TaskModal.tsx',
    'src/components/TaskDetailModal.tsx',
    'src/components/ExportModal.tsx',
    'src/components/LocationReminderModal.tsx',
    'src/components/GroupModal.tsx',
    'src/components/AuthModal.tsx',
    'src/views/DashboardView.tsx',
    'src/views/KanbanView.tsx',
    'src/views/ListView.tsx',
    'src/views/CalendarView.tsx',
    'src/views/AnalyticsView.tsx',
    'src/views/LecturerView.tsx',
    'src/views/GroupView.tsx'
  ];

  for (const filePath of sourceFiles) {
    try {
      const response = await fetch(`/${filePath}`);
      if (response.ok) {
        const text = await response.text();
        zip.file(filePath, text);
      }
    } catch (e) {
      console.warn(`Could not fetch ${filePath}, skipping`, e);
    }
  }

  // Generate and download zip
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sim-tugas-mahasiswa-vscode.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
