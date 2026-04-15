export interface Skill { id: string; name: string; level: number; category: string; color: string; years: number }
export interface Experience { id: string; company: string; role: string; start: number; end: number | null; color: string; highlights: string[] }
export interface Project { id: string; name: string; description: string; stack: string[]; status: 'live' | 'building'; color: string }

export const SKILLS: Skill[] = [
  { id: 'python',     name: 'Python',             level: 95, category: 'Backend',   color: '#818cf8', years: 10 },
  { id: 'langchain',  name: 'LangChain / LangGraph', level: 92, category: 'AI/ML',  color: '#a78bfa', years: 3  },
  { id: 'crewai',     name: 'CrewAI / AutoGen',   level: 88, category: 'AI/ML',     color: '#c084fc', years: 2  },
  { id: 'openai',     name: 'OpenAI / Claude API', level: 90, category: 'AI/ML',    color: '#7c3aed', years: 3  },
  { id: 'pytorch',    name: 'PyTorch / TensorFlow', level: 82, category: 'AI/ML',   color: '#e879f9', years: 4  },
  { id: 'mlops',      name: 'MLflow / MLOps',     level: 80, category: 'AI/ML',     color: '#9061e8', years: 3  },
  { id: 'fastapi',    name: 'FastAPI',            level: 90, category: 'Backend',   color: '#2dd4bf', years: 4  },
  { id: 'django',     name: 'Django / Flask',     level: 85, category: 'Backend',   color: '#34d399', years: 5  },
  { id: 'golang',     name: 'Go / Golang',        level: 80, category: 'Backend',   color: '#22d3ee', years: 4  },
  { id: 'java',       name: 'Java 17+ / Spring Boot', level: 82, category: 'Backend', color: '#fbbf24', years: 5 },
  { id: 'react',      name: 'React / Next.js',    level: 88, category: 'Frontend',  color: '#38bdf8', years: 5  },
  { id: 'angular',    name: 'Angular',            level: 85, category: 'Frontend',  color: '#f472b6', years: 5  },
  { id: 'ts',         name: 'TypeScript',         level: 92, category: 'Frontend',  color: '#60a5fa', years: 8  },
  { id: 'aws',        name: 'AWS',                level: 88, category: 'Cloud',     color: '#f59e0b', years: 6  },
  { id: 'gcp',        name: 'GCP / Vertex AI',    level: 82, category: 'Cloud',     color: '#60a5fa', years: 4  },
  { id: 'azure',      name: 'Azure',              level: 80, category: 'Cloud',     color: '#38bdf8', years: 4  },
  { id: 'docker',     name: 'Docker / Kubernetes', level: 88, category: 'Cloud',    color: '#67e8f9', years: 6  },
  { id: 'terraform',  name: 'Terraform / IaC',    level: 82, category: 'Cloud',     color: '#a78bfa', years: 4  },
  { id: 'kafka',      name: 'Kafka / RabbitMQ',   level: 85, category: 'Messaging', color: '#fb923c', years: 5  },
  { id: 'postgresql', name: 'PostgreSQL',         level: 90, category: 'Database',  color: '#34d399', years: 8  },
  { id: 'mongodb',    name: 'MongoDB / DynamoDB', level: 82, category: 'Database',  color: '#4ade80', years: 5  },
  { id: 'redis',      name: 'Redis',              level: 85, category: 'Database',  color: '#f87171', years: 5  },
  { id: 'rag',        name: 'RAG / Vector Search', level: 88, category: 'AI/ML',   color: '#818cf8', years: 3  },
]

export const SKILL_CONNECTIONS: [string, string][] = [
  ['python', 'langchain'], ['langchain', 'crewai'], ['langchain', 'openai'],
  ['openai', 'rag'], ['pytorch', 'mlops'], ['python', 'fastapi'],
  ['python', 'django'], ['fastapi', 'rag'], ['golang', 'docker'],
  ['react', 'ts'], ['angular', 'ts'], ['docker', 'terraform'],
  ['aws', 'docker'], ['gcp', 'docker'], ['azure', 'docker'],
  ['kafka', 'redis'], ['postgresql', 'rag'], ['mongodb', 'redis'],
  ['java', 'kafka'], ['aws', 'terraform'], ['mlops', 'gcp'],
  ['crewai', 'openai'], ['django', 'postgresql'],
]

export const EXPERIENCES: Experience[] = [
  { id: 'ab', company: 'Anheuser-Busch', role: 'Senior .NET Full-Stack Developer',
    start: 2024, end: null, color: '#f59e0b',
    highlights: ['Event-driven microservices on .NET 8 processing 1M+ daily transactions', 'Angular 17 modernisation — reduced page load times by 45%', 'Kafka real-time inventory pipeline with 99.97% uptime SLA', 'Architected CQRS + MediatR patterns across 12 bounded contexts', 'AWS Lambda integration for serverless batch processing'] },
  { id: 'tesla', company: 'Tesla', role: '.NET / Full-Stack Engineer',
    start: 2022, end: 2024, color: '#f87171',
    highlights: ['Manufacturing data pipeline tooling serving 500k+ daily API requests', 'ASP.NET Core APIs with sub-50ms p99 latency at scale', 'Docker/K8s deployment standardisation across 8 engineering teams', 'GCP BigQuery integration for real-time production analytics', 'Built CI/CD pipelines reducing deployment time by 60%'] },
  { id: 'mcd', company: "McDonald's", role: 'Senior Software Developer',
    start: 2020, end: 2022, color: '#fbbf24',
    highlights: ['POS integration APIs for 40,000+ global franchise locations', 'RabbitMQ event bus — 30% order latency reduction', 'AWS S3 + CloudFront CDN architecture for menu asset delivery', 'Led migration from monolith to microservices architecture'] },
  { id: 'swa', company: 'Southwest Airlines', role: '.NET Developer',
    start: 2018, end: 2020, color: '#818cf8',
    highlights: ['Azure Service Bus flight operations pipelines handling 4k+ daily flights', 'High-availability booking microservices with 99.99% uptime', 'GCP Pub/Sub integration for cross-platform event streaming', 'Optimised SQL Server queries — 3x improvement in report generation'] },
  { id: 'centene', company: 'Centene Corporation', role: 'Software Developer',
    start: 2016, end: 2018, color: '#38bdf8',
    highlights: ['Healthcare data APIs in .NET serving 2M+ member records', 'SQL Server performance optimisation — reduced query times by 70%', 'Built HIPAA-compliant data encryption layer for PHI'] },
  { id: 'citizens', company: 'Citizens Bank', role: 'Junior .NET Developer',
    start: 2013, end: 2016, color: '#34d399',
    highlights: ['Banking transaction APIs in C#/.NET handling $500M+ daily volume', 'Developed automated reconciliation system reducing manual effort by 80%'] },
]

export const PROJECTS: Project[] = [
  { id: 'aca', name: 'AI Career Agent', status: 'live',
    description: 'Autonomous AI recruiter — 28 microservices that crawl 5 job boards, analyze listings with GPT-4o, generate tailored resumes, and auto-apply. Event-driven via RabbitMQ with real-time Telegram alerts.',
    stack: ['FastAPI', 'Next.js', 'React Native', 'PostgreSQL', 'Qdrant', 'RabbitMQ', 'Docker', 'OpenAI'], color: '#2dd4bf' },
  { id: 'vb', name: 'Venture Builder', status: 'live',
    description: 'Fully autonomous 19-step AI startup factory — discovers market opportunities, generates & validates startup ideas, builds MVPs, designs brands, creates pitch decks, deploys products, runs growth hacking, and manages a live portfolio with scale/kill/hold decisions. 11 AI agents + Qdrant vector DB.',
    stack: ['FastAPI', 'LM Studio', 'Qdrant', 'Python', 'Docker', 'Telegram Bot API'], color: '#f59e0b' },
  { id: 'abp', name: 'Your AI Buddy', status: 'live',
    description: 'Gamified SaaS platform for mastering AI in 30 days — interactive game-map roadmap, AI chat coach, prompt factory, career hub (resume critique, mock interviews, job matching), app builder, certification engine, and public leaderboard.',
    stack: ['React', 'TypeScript', 'Supabase', 'Gemini', 'Groq', 'Tailwind CSS'], color: '#a78bfa' },
  { id: 'av', name: 'Abhiverse', status: 'live',
    description: 'This portfolio — data-driven 3D planetary visualizations per section with an AI clone chatbot. R3F + Groq API + GSAP + TypeScript.',
    stack: ['React Three Fiber', 'Groq API', 'GSAP', 'TypeScript', 'GLSL'], color: '#818cf8' },
]
