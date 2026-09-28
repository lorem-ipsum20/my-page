/**
 * All portfolio content lives here.
 * Sources: resume, github.com/aman-singanamala, medium.com/@embed17
 */
import type { Tone } from "@/lib/tones";

export const profile = {
  name: "Aman Singanamala",
  firstName: "Aman",
  lastName: "Singanamala",
  initials: "AS",
  role: "Full Stack Software Developer",
  tagline:
    "I build scalable, secure web applications — React on the front, Spring Boot and Java on the back, shipped on Azure.",
  location: "Pune, India",
  timezone: "IST (UTC+5:30)",
  email: "amansinganamala@gmail.com",
  phone: "+91 81791 00748",
  avatar: "https://github.com/aman-singanamala.png?size=460",
  // Served from the GitHub Releases "latest download" URL: the address never
  // changes, but it always returns the newest asset on the `resume` release —
  // so the résumé is updated by replacing the release asset, not by redeploying.
  // The replacement file must keep the exact same filename.
  resumeUrl: "https://github.com/lorem-ipsum20/my-page/releases/latest/download/AmanSinganamala-Resume.pdf",
  summary:
    "Full Stack Software Developer with experience building scalable web applications using React.js, Spring Boot, Java, JavaScript, TypeScript and REST APIs in enterprise environments, with growing hands-on expertise in AI-driven development using LLMs, LangChain and agentic application tooling.",
  summarySecondary:
    "Proven expertise in authentication systems, role-based access control (RBAC), microservices architecture and cloud-native deployments on Microsoft Azure (AKS, Azure Active Directory, Blob Storage). Strong background in designing secure, high-performance applications, implementing automated testing, and working in Agile/Scrum teams to deliver reliable, production-ready software solutions.",
  currently: "Building secure, cloud-native banking software at UBS.",
} as const;

export const interests: { label: string; tone: Tone }[] = [
  { label: "Distributed systems", tone: "cyan" },
  { label: "LLM & agentic tooling", tone: "emerald" },
  { label: "Developer education", tone: "amber" },
  { label: "Algorithm visualization", tone: "violet" },
];

export type SocialLink = {
  label: string;
  handle: string;
  href: string;
  icon: "github" | "linkedin" | "leetcode" | "medium" | "mail" | "twitter" | "phone";
};

export const socials: SocialLink[] = [
  {
    label: "GitHub",
    handle: "aman-singanamala",
    href: "https://github.com/aman-singanamala",
    icon: "github",
  },
  {
    label: "LeetCode",
    handle: "aman2278",
    href: "https://leetcode.com/u/aman2278/",
    icon: "leetcode",
  },
  {
    label: "LinkedIn",
    handle: "in/amansinganamala",
    href: "https://linkedin.com/in/amansinganamala",
    icon: "linkedin",
  },
  {
    label: "Medium",
    handle: "@embed17",
    href: "https://medium.com/@embed17",
    icon: "medium",
  },
  {
    label: "X (Twitter)",
    handle: "@amans3103",
    href: "https://x.com/amans3103",
    icon: "twitter",
  },
  {
    label: "Email",
    handle: "amansinganamala@gmail.com",
    href: "mailto:amansinganamala@gmail.com",
    icon: "mail",
  },
];

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Writing", href: "#writing" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export type Job = {
  company: string;
  title: string;
  period: string;
  start: string;
  end: string;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experience: Job[] = [
  {
    company: "UBS",
    title: "Software Developer (Full Stack Web Developer)",
    period: "Aug 2024 — Present",
    start: "2024-08",
    end: "Present",
    location: "Pune, India",
    summary:
      "Full-stack ownership of authentication, records management and investment modules for internal banking platforms.",
    highlights: [
      "Engineered a secure, scalable OTP-based authentication system using React.js and Spring Boot — end-to-end OTP generation and validation with global state management for consistent auth behavior across multi-tab sessions, supporting 1,000+ daily authentication requests.",
      "Built modular, type-safe grid components and a dynamic records management module with advanced filtering and editing, improving UI responsiveness for real-time customer verification workflows.",
      "Implemented React UI test cases using Vitest, achieving 94% line code coverage and reducing UI regression issues.",
      "Architected an end-to-end Mutual Fund investment module with React dashboards for portfolio tracking and scalable Spring Boot APIs for secure transaction processing, supporting concurrent user workflows.",
      "Engineered a Maker-Checker approval system for sensitive bulk uploads (CSV, XLSX), enforcing strict validation layers before database persistence and reducing data inconsistencies by 99%.",
      "Implemented enterprise-grade RBAC using Azure Active Directory and Microsoft Graph API, securing API endpoints and enforcing authorized access for 5+ distinct user roles.",
      "Developed an internal onboarding tool that centralized role-based access and permissions, cutting manual access coordination by 50% and accelerating new-hire onboarding.",
      "Mentored junior engineers through task assignments and code reviews within an Agile/Scrum workflow, raising code quality standards and sprint execution efficiency.",
    ],
    stack: ["React.js", "Spring Boot", "Java", "TypeScript", "Azure AD", "Vitest", "PostgreSQL"],
  },
  {
    company: "UBS",
    title: "Software Developer Intern (Full Stack Web Developer)",
    period: "Jan 2024 — Jul 2024",
    start: "2024-01",
    end: "2024-07",
    location: "Pune, India",
    summary:
      "Shipped a full-stack pricing-rate platform and the container/deploy pipeline that carried it.",
    highlights: [
      "Developed a full-stack application to manage client-specific pricing rates, supporting validation workflows during trade bookings and reducing manual verification efforts by 95%.",
      "Designed robust REST APIs and integrated frontend services using Axios, with secure handling of headers, authentication tokens and error states for stable client-server communication.",
      "Set up PostgreSQL databases for web applications, enabling reliable storage and retrieval using Azure Cloud, Ansible and pgAdmin.",
      "Orchestrated containerization and deployment using Docker and Kubernetes on Azure Kubernetes Service (AKS), leveraging Ansible for configuration management and reducing environment setup time by 30%.",
    ],
    stack: ["React.js", "Spring Boot", "Axios", "PostgreSQL", "Docker", "Kubernetes", "Ansible"],
  },
];

export type Project = {
  name: string;
  year: string;
  kind: string;
  description: string;
  highlights: string[];
  stack: string[];
  demoUrl: string | null;
  repoUrl: string | null;
  accent: Tone;
};

export const projects: Project[] = [
  {
    name: "DSA Lab",
    year: "2026",
    kind: "Learning platform",
    description:
      "An interactive algorithm and data structure visualizer that helps students understand core CS concepts through step-by-step visual execution.",
    highlights: [
      "Visualizes algorithm execution step by step for arrays, hash maps, graphs, recursion and sliding-window problems.",
      "Google OAuth and Supabase-backed accounts let learners save visualizations by topic and revisit their practice history.",
      "Integrated an NVIDIA NIM-powered translation layer and an in-app DSA tutor that gives grounded, step-by-step explanations from the current execution trace.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "shadcn/ui",
      "Supabase",
      "PostgreSQL",
      "Google OAuth",
      "NVIDIA NIM",
      "Vercel",
    ],
    demoUrl: "https://codevisualizer.vercel.app/",
    repoUrl: null,
    accent: "emerald",
  },
  {
    name: "linkhub",
    year: "2026",
    kind: "Microservices",
    description:
      "A microservices-based social bookmarking app with a Spring Boot service mesh behind a React client.",
    highlights: [
      "Split into independently deployable services with their own persistence boundaries.",
      "REST contracts consumed by a React front end with optimistic UI updates.",
    ],
    stack: ["Spring Boot", "Java", "React", "Microservices", "REST APIs"],
    demoUrl: null,
    repoUrl: "https://github.com/aman-singanamala/linkhub",
    accent: "sky",
  },
  {
    name: "Uber ETL Pipeline",
    year: "2023",
    kind: "Data engineering",
    description:
      "An end-to-end ETL pipeline over Uber trip data — ingestion, transformation and analytical modelling.",
    highlights: [
      "Modelled raw trip data into analysis-ready tables through staged transformations.",
      "Explored demand, pricing and trip-distribution patterns from the resulting warehouse.",
    ],
    stack: ["Python", "Jupyter", "SQL", "ETL"],
    demoUrl: null,
    repoUrl: "https://github.com/aman-singanamala/Uber-ETL-Pipeline",
    accent: "amber",
  },
  {
    name: "Streamlit Apps",
    year: "2023",
    kind: "Data apps",
    description:
      "A collection of analytics dashboards and ML demos built with Streamlit for fast, shareable data tooling.",
    highlights: [
      "Turned notebook experiments into interactive, deployable dashboards.",
      "Patterned reusable visualisation components across multiple apps.",
    ],
    stack: ["Python", "Streamlit", "Pandas", "scikit-learn"],
    demoUrl: null,
    repoUrl: "https://github.com/aman-singanamala/Streamlit-Apps",
    accent: "violet",
  },
];

export type Post = {
  title: string;
  date: string;
  year: string;
  readingTime: string;
  tags: string[];
  url: string;
  blurb: string;
};

export const posts: Post[] = [
  {
    title: "Protect Your Express.js Routes: A Simple Authentication Middleware Tutorial",
    date: "Jan 2025",
    year: "2025",
    readingTime: "6 min",
    tags: ["Express", "Authentication", "JavaScript"],
    url: "https://embed17.medium.com/protect-your-express-js-routes-a-simple-authentication-middleware-tutoria-cd720ef19cb3",
    blurb:
      "Build a JWT-based auth middleware from scratch, protect routes and handle tokens safely on the client.",
  },
  {
    title: "Getting started with Redux in ReactJS",
    date: "Nov 2024",
    year: "2024",
    readingTime: "5 min",
    tags: ["React", "Redux", "State management"],
    url: "https://embed17.medium.com/getting-started-with-redux-in-reactjs-310317-92a1d895d408",
    blurb:
      "A practical walkthrough of stores, reducers, useDispatch and useSelector with Redux Toolkit.",
  },
  {
    title: "Out of Boundary Paths — Leetcode 576",
    date: "Jan 2024",
    year: "2024",
    readingTime: "4 min",
    tags: ["Java", "DP", "Leetcode"],
    url: "https://embed17.medium.com/out-of-boundary-paths-leetcode-576-8c19b5e234d7",
    blurb:
      "Recursion with memoization, and why it collapses an exponential search into O(m·n·maxMove).",
  },
  {
    title: "Recursion: Subsets, Subsequences, Strings",
    date: "Jan 2024",
    year: "2024",
    readingTime: "4 min",
    tags: ["Java", "Recursion"],
    url: "https://embed17.medium.com/recursion-subset-subsequences-string-19089ddbcc57",
    blurb:
      "Four flavours of the same include/exclude recursion, from printing to collecting results.",
  },
  {
    title: "Add Two Numbers",
    date: "May 2023",
    year: "2023",
    readingTime: "3 min",
    tags: ["Java", "Linked lists", "Leetcode"],
    url: "https://embed17.medium.com/add-two-numbers-fc8075a3b5eb",
    blurb:
      "Digit-by-digit linked list addition with a dummy head and carry propagation, traced step by step.",
  },
  {
    title: "Machine Learning Pipeline with scikit-learn",
    date: "Feb 2023",
    year: "2023",
    readingTime: "4 min",
    tags: ["Python", "scikit-learn", "ML"],
    url: "https://embed17.medium.com/machine-learning-pipeline-using-scikit-learn-a8194059a7f6",
    blurb:
      "Chaining preprocessing, cross-validation and hyperparameter tuning into one reproducible pipeline.",
  },
  {
    title: "Word Vectors and Word2Vec in NLP",
    date: "Dec 2022",
    year: "2022",
    readingTime: "9 min",
    tags: ["NLP", "Machine learning"],
    url: "https://embed17.medium.com/word-vectors-and-word2vec-in-nlp-6e17b1a07d9a",
    blurb:
      "Skip-gram vs CBOW, negative sampling, and how stemming and lemmatization fit into an NLP pipeline.",
  },
  {
    title: "Cross Validation",
    date: "Oct 2022",
    year: "2022",
    readingTime: "4 min",
    tags: ["Machine learning", "sklearn"],
    url: "https://embed17.medium.com/cross-validation-71d4768a18c",
    blurb:
      "Why a single train/test split lies to you, and how k-fold gives a model the honesty it needs.",
  },
];

export type SkillGroup = {
  title: string;
  tone: Tone;
  blurb: string;
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    tone: "sky",
    blurb: "What I write day to day",
    skills: ["Java", "JavaScript (ES6+)", "TypeScript", "Python", "SQL"],
  },
  {
    title: "Frontend",
    tone: "violet",
    blurb: "Interfaces and design systems",
    skills: ["React.js", "Next.js", "Tailwind CSS", "shadcn/ui", "HTML", "CSS"],
  },
  {
    title: "Backend",
    tone: "amber",
    blurb: "Services, contracts and data flow",
    skills: ["Spring Boot", "Node.js", "Microservices", "REST APIs"],
  },
  {
    title: "AI & LLM Tooling",
    tone: "emerald",
    blurb: "Agents and grounded retrieval",
    skills: [
      "LangChain",
      "LLM Integration",
      "Agentic Application Development",
      "Model Context Protocol (MCP)",
      "GitHub Copilot",
      "Codex",
    ],
  },
  {
    title: "Cloud & DevOps",
    tone: "cyan",
    blurb: "Shipping and keeping it up",
    skills: [
      "Microsoft Azure (AKS, AD, Blob Storage)",
      "Docker",
      "Kubernetes",
      "Ansible",
      "Vercel",
    ],
  },
  {
    title: "Databases & Tools",
    tone: "rose",
    blurb: "Storage and the daily driver kit",
    skills: [
      "PostgreSQL",
      "MongoDB",
      "Supabase",
      "Git",
      "GitLab",
      "Postman",
      "Linux",
      "pgAdmin",
    ],
  },
];

export const certifications = [
  "Microsoft Azure Fundamentals (AZ-900)",
  "UBS Certified Engineer",
];

export const education = [
  {
    school: "Vellore Institute of Technology",
    qualification: "B.Tech, Computer Science",
    detail: "CGPA 8.86 / 10.0",
    period: "2020 — 2024",
    location: "Vellore, India",
  },
  {
    school: "Narayana Junior College",
    qualification: "High School",
    detail: "98.5%",
    period: "2018 — 2020",
    location: "Hyderabad, India",
  },
];

export const awards: { title: string; org: string; detail: string; tone: Tone }[] = [
  {
    title: "Engineering Excellence Award",
    org: "UBS",
    detail: "Awarded for outstanding performance as a Graduate Trainee.",
    tone: "amber",
  },
  {
    title: "Editorial Head",
    org: "IEEE MTTS, VIT",
    detail: "Led editorial work for the Microwave Theory and Technique Society chapter.",
    tone: "violet",
  },
  {
    title: "Content Writer",
    org: "CSED, VIT",
    detail: "Wrote for the Centre for Social Entrepreneurship and Development.",
    tone: "sky",
  },
];

/** Section anchors shared by every design. */
export const SECTIONS = ["about", "experience", "projects", "writing", "skills", "contact"] as const;
