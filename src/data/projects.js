// Data project (placeholder). Ganti isinya dengan project asli Anda.
// - image:   gambar untuk kartu di halaman utama. null = gradient placeholder.
// - gallery: daftar gambar di halaman detail, mis. ['/projects/a-1.jpg', '/projects/a-2.jpg'].
//            Kosong ([]) = pakai `image`; kalau `image` juga null, tampil 3 placeholder.
// - about:   paragraf di halaman detail (idealnya 5-6 baris).
// - url:     link "Visit site". Isi '' kalau tidak ada, linknya otomatis hilang.
// - launch:  ditampilkan sebagai "End date".
// - recognition: isi [] kalau tidak ada, barisnya otomatis hilang.
// - swatches: 3 warna kecil di sisi kanan layar.
//
// Path gambar tetap ditulis seperti biasa ('/projects/nama.png', file ada di public/projects/).
// Di bagian paling bawah file ini, path itu otomatis diberi alamat dasar situs
// (/portfolio/ saat di GitHub Pages), jadi tidak perlu diubah manual.
const aboutPlaceholder =
  'A placeholder paragraph about this project. Describe the challenge you were given, how you approached it, and the result. Keep it to five or six lines so it sits comfortably beside the gallery.'

const rawProjects = [
  {
    slug: 'planner-in',
    category: 'Productivity Hub',
    title: 'Planner-in',
    description:
      'A productivity platform for managing tasks, organizing schedules, and tracking goals efficiently.',
    about: 
      "Planner-in is your all-in-one productivity hub designed to help you stay organized, focused, and efficient. Built using Laravel 10 and MySQL, Planner-in provides an intuitive and user-friendly platform to manage your daily schedule, organize to-do lists, and set achievable goals. Whether you're juggling personal tasks, work projects, or school assignments, the platform helps you keep everything organized in one place. With features like task prioritization, deadline reminders, and progress tracking, Planner-in makes it easier to streamline your workflow, manage your time effectively, and stay on top of everything that matters.",
    url: '',
    role: ['Full Stack Developer', 'Quality Assurance'],
    launch: 'June 2024',
    recognition: [],
    palette: ['#111111', '#5a5a5a'],
    swatches: ['#3d3192', '#ece8fa', '#a79dd4'],
    url: 'https://github.com/2004jepreh/Planner-in',
    linkLabel: 'View on GitHub',
    image: '/projects/planner-in.png',
    cardFit: 'contain', 
    cardBg: 'auto', 
    cardPad: '5%',
    gallery: [
      '/projects/planner-1.png',
      '/projects/planner-2.png',
      '/projects/planner-3.png',
      '/projects/planner-4.png',
      '/projects/planner-5.png',
    ],
  },
  {
    slug: 'mrtg-supercorridor',
    category: 'Network Monitoring Platform',
    title: 'MRTG Supercorridor',
    description:
      'A network monitoring platform for tracking bandwidth usage, device status, and traffic trends through an integrated dashboard.',
    about:
      'MRTG Supercorridor is a web-based network monitoring platform I developed for PT Trans Indonesia Superkoridor to visualize and manage network traffic data across multiple devices and interfaces. Built with Laravel 12 and MySQL, the platform integrates with Cacti to retrieve and display MRTG-generated traffic graphs, allowing network engineers and customers to monitor bandwidth utilization and review network traffic history. Customers can view their bandwidth usage over a specified time period, providing better visibility into consumption patterns and helping them understand their network usage. The dashboard centralizes traffic visualization based on IP addresses, devices, and interfaces, making historical data more accessible while supporting network troubleshooting, usage analysis, and more transparent bandwidth monitoring.',
    url: '',
    role: ['Full Stack Developer', 'Quality Assurance', 'Technical Writer'],
    launch: 'August 2025',
    recognition: [],
    palette: ['#2b3a67', '#8aa1d8'],
    swatches: ['#00ad4f', '#f26b21', '#5bb5e0'],
    image: '/projects/mrtg-supercorridor.jpeg',
    cardFit: 'contain',
    cardBg: '#ffffff',
    cardPad: '14%',
    gallery: [
      '/projects/mrtg-1.png',
      '/projects/mrtg-2.png',
      '/projects/mrtg-3.png',
      '/projects/mrtg-4.png',
      '/projects/mrtg-5.png',
    ],
  },
  {
    slug: 'access-control-system',
    category: 'Security Monitoring Platform',
    title: 'Access Control System',
    description:
      'A web-based access control system for managing server room access requests, approval workflows, and audit records.',
    about: 
      'Access Control System (ACS) is a web-based platform I developed for PT Trans Indonesia Superkoridor to manage and track server room access requests within the company. Built with Laravel 12 and MySQL, it implements role-based access control where guests and employees can submit visit requests, managers review and approve or reject them, and super admins oversee configuration, users, and audit logs. The system is also integrated with a custom face recognition system that I developed using Python and the OpenCV library to support identity verification and enhance access security. ACS centralizes all request histories, approval decisions, and access records in a single dashboard, improving traceability, accountability, and operational security for critical infrastructure areas.',
    url: '',
    role: ['Full Stack Developer', 'Quality Assurance', 'Technical Writer'],
    launch: 'November 2025',
    recognition: [],
    palette: ['#3d2c2e', '#c9a38f'],
    swatches: ['#f47b20', '#fbbf1b', '#f6f6f6'],
    image: '/projects/access-control-system.jpeg',
    cardFit: 'contain',
    cardBg: '#f6f6f6',
    cardPad: '10%',
    gallery: [
      '/projects/access-1.jpeg',
      '/projects/access-2.jpeg',
      '/projects/access-3.jpeg',
      '/projects/access-4.jpeg',
      '/projects/access-5.jpeg',
      '/projects/access-6.jpeg',
    ],
  },
  {
    slug: 'monitoring-rectifier-alarm',
    category: 'Alarm Monitoring Platform',
    title: 'Rectifier Alarm Monitoring Dashboard',
    description:
      'A real-time monitoring dashboard for tracking rectifier alarms, managing incidents, and streamlining issue resolution for NOC teams.',
    about: 
      'Rectifier Alarm Monitoring Dashboard is a web-based monitoring platform I developed for PT Trans Indonesia Superkoridor to centralize rectifier alarm monitoring and incident management for NOC teams. Built with Laravel 12 and MySQL, the system is integrated with a custom SNMP Trap Receiver that I developed using Python to receive and process alarm notifications directly from rectifier devices. The dashboard provides clear alarm visibility, detailed event information, device status monitoring, and historical records to help engineers identify power-related issues and investigate incidents more efficiently. It also supports alarm lifecycle management, allowing operators to track active and resolved alarms while maintaining accurate event timestamps and records. By combining automated alarm collection with centralized monitoring and management, the platform improves operational visibility, simplifies troubleshooting, and supports more efficient network infrastructure maintenance.',
    url: '',
    role: ['Full Stack Developer', 'Quality Assurance', 'Technical Writer'],
    launch: 'February 2026',
    recognition: [],
    palette: ['#1f4d3a', '#8ec7a5'],
    swatches: ['#1f5fa8', '#4aa3f0', '#f5f5f5'],
    image: '/projects/alarm-rectifier.jpeg',
    cardFit: 'contain',
    cardBg: 'auto',
    cardPad: '8%',
    gallery: [
      '/projects/alarm-1.jpeg',
      '/projects/alarm-2.jpeg',
      '/projects/alarm-3.jpeg',
      '/projects/alarm-4.jpeg',
      '/projects/alarm-5.jpeg',
    ],
  },
  {
    slug: 'singkarak-ims',
    category: 'Inventory Management System',
    title: 'SingkarakIMS',
    description:
      'A web-based inventory management system for tracking stock, managing transactions, and streamlining store operations.',
    about: 
      'SingkarakIMS is a web-based inventory management system built with Laravel 13 and MySQL to optimize daily operations and stock tracking for Singkarak Store. The system features multi-item purchase and sale transaction modules, automated stock movement audit logs, product price history tracking, and Role-Based Access Control (RBAC). Additionally, SingkarakIMS integrates custom employee salary and cash advance loan management modules, and is fully deployed on a production environment.',
    url: '',
    role: ['System Analyst','Full Stack Developer','Quality Assurance'],
    launch: 'October 2026',
    recognition: [],
    palette: ['#4a2d6b', '#b69ae0'],
    swatches: ['#363f4d', '#9aa0a8', '#eceef1'],
    url: 'https://github.com/2004jepreh/SingkarakIMS',
    linkLabel: 'View on GitHub',
    image: '/projects/singkarak-ims.png',
    cardFit: 'contain',
    cardBg: '#ffffff',
    cardPad: '5%',
    gallery: [
      '/projects/singkarak-1.png',
      '/projects/singkarak-2.png',
      '/projects/singkarak-3.png',
      '/projects/singkarak-4.png',
      '/projects/singkarak-5.png',
      '/projects/singkarak-6.png',
      '/projects/singkarak-7.png',
      '/projects/singkarak-8.png',
      '/projects/singkarak-9.png',
    ],
  },
  {
    slug: 'coming-soon',
    category: 'Unknown',
    title: 'Coming Soon',
    description:
      'A placeholder description for your sixth project. Finish with a concrete result, like users, speed or revenue.',
    about: aboutPlaceholder,
    url: '',
    role: ['Full Stack Developer', 'DevOps'],
    launch: 'October 2026',
    recognition: [],
    palette: ['#7a3b1d', '#e8b48a'],
    swatches: ['#7a3b1d', '#fbeadb', '#4fa3a5'],
    image: null,
    gallery: [],
  },
]

// Menambahkan alamat dasar situs ke path gambar yang diawali "/"
// (BASE_URL = '/' saat lokal tanpa base, '/portfolio/' di GitHub Pages)
const withBase = (path) => {
  if (!path || !path.startsWith('/')) return path // null, atau sudah URL penuh (https://...)
  return `${import.meta.env.BASE_URL}${path.slice(1)}`
}

export const projects = rawProjects.map((p) => ({
  ...p,
  image: withBase(p.image),
  gallery: (p.gallery || []).map(withBase),
}))