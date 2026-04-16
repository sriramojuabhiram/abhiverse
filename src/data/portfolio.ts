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
  { id: 'ab', company: 'Anheuser-Busch InBev', role: 'Lead Full Stack Developer — .NET / Angular / AI',
    start: 2024, end: null, color: '#f59e0b',
    highlights: ['Architected scalable enterprise apps using ASP.NET Core .NET 8 microservices and Angular 17', 'Integrated OpenAI GPT-4 and Claude via LangChain orchestration, reducing manual processing by ~40%', 'Enterprise semantic search using Azure AI Services, FAISS, and LlamaIndex across 500K+ documents', 'CI/CD pipelines in Azure DevOps: xUnit → SonarQube → Docker → AKS rolling deploy', 'Championed AI-first engineering culture — authored GitHub Copilot onboarding playbook for 20+ engineers'] },
  { id: 'tesla', company: 'Tesla, Inc.', role: 'Senior Software Development Engineer / AI-ML Engineer',
    start: 2023, end: 2024, color: '#f87171',
    highlights: ['Scalable ASP.NET Core Web API microservices with JWT/RBAC via Azure API Management', 'Integrated predictive ML models (Python / Scikit-learn / PyTorch) as REST API endpoints', 'Deployed Azure ML pipelines for LLM fine-tuning (LoRA/PEFT via Hugging Face Transformers)', 'Containerized services with Docker on AKS — reduced inference latency by 45% via Azure Redis Cache', 'OpenAI-powered code review in GitHub Actions CI/CD workflows'] },
  { id: 'mcd', company: "McDonald's Corporation", role: 'Senior .NET Developer — Cloud & Data',
    start: 2021, end: 2022, color: '#fbbf24',
    highlights: ['ML-based vulnerability prioritization system — reduced critical-issue triage time by ~50%', 'Real-time event-driven data pipelines using Apache Kafka, Flink, and Airflow on AWS', 'Angular and React UI components integrated with .NET backend APIs'] },
  { id: 'corteva', company: 'Corteva Agriscience', role: 'Senior .NET Developer — Cloud / Full Stack',
    start: 2020, end: 2021, color: '#22d3ee',
    highlights: ['Deployed .NET and Flask apps on Azure and AWS containerized with Docker', 'Managed Kubernetes clusters with Helm; serverless patterns (API Gateway, Lambda, DynamoDB)', 'Built React.js UI components and Node.js backend services; integrated SonarQube into CI pipelines'] },
  { id: 'centene', company: 'Centene Corporation', role: 'Senior Software Application Engineer',
    start: 2018, end: 2020, color: '#38bdf8',
    highlights: ['Led migration of 500K+ LOC .NET Framework monolith to cloud-native ASP.NET Core microservices on Azure', 'HIPAA-compliant ASP.NET Core Web APIs with OAuth2/JWT, Oracle Database and SQL Server backends', 'Terraform IaC modules reducing environment provisioning time by 70%', 'Angular 2+ frontend with RxJS/NgRx for regulated healthcare workflows'] },
  { id: 'swa', company: 'Southwest Airlines', role: 'Senior .NET Developer — Azure / DevOps',
    start: 2017, end: 2018, color: '#818cf8',
    highlights: ['Enterprise ASP.NET Core MVC / Web API with Entity Framework Core and SQL Server', 'Angular 2+ / TypeScript frontends with RxJS/NgRx state management', 'Azure App Service deployment with Application Insights monitoring; CI/CD with Azure DevOps and Docker'] },
  { id: 'citizens', company: 'Citizens Bank', role: 'Senior .NET Developer',
    start: 2016, end: 2016, color: '#34d399',
    highlights: ['ASP.NET MVC frameworks and Entity Framework / LINQ data access against Oracle Database and SQL Server', 'PL/SQL stored procedures and query tuning for core banking workloads'] },
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
