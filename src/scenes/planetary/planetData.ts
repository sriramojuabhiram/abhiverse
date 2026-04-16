export interface PlanetSection {
  id: string
  name: string
  subtitle: string
  type: 'earth' | 'gas' | 'rocky' | 'ice' | 'star' | 'nebula'
  position: [number, number, number]
  radius: number
  rotationSpeed: number
  tilt: number
  colors: {
    primary: string
    secondary: string
    accent: string
    atmosphere: string
  }
  hasAtmosphere: boolean
  hasClouds: boolean
  hasRings: boolean
  ringColor?: string
  noiseScale: number
  cameraPosition: [number, number, number]
  cameraLookAt: [number, number, number]
  panelSide: 'left' | 'right'
  content: {
    heading: string
    description: string
    items: Array<{ label: string; value: string; link?: string }>
  }
}

export const planets: PlanetSection[] = [
  {
    id: 'about',
    name: 'About',
    subtitle: 'Home World',
    type: 'earth',
    position: [0, 0, 0],
    radius: 1.3,
    rotationSpeed: 0.003,
    tilt: 0.41,
    colors: {
      primary: '#0e4478',
      secondary: '#1a6b42',
      accent: '#c4a050',
      atmosphere: '#38bdf8',
    },
    hasAtmosphere: true,
    hasClouds: true,
    hasRings: false,
    noiseScale: 7.0,
    cameraPosition: [-3, 0.6, 4.5],
    cameraLookAt: [-3, 0, 0],
    panelSide: 'left',
    content: {
      heading: 'About Me',
      description:
        'Senior Full Stack .NET Developer with 11+ years of experience designing and delivering high-performance, scalable applications across the complete SDLC. Expert-level proficiency in C# / .NET 8+, Angular (2–17), and React, with deep backend expertise in ASP.NET Core Web APIs, microservices architecture, and database design at scale. Proven leader in AI-first engineering: integrating LLM-based workflows (OpenAI GPT-4, Anthropic Claude, LangChain), AI-assisted development (GitHub Copilot, Cursor), and intelligent test generation into production environments.',
      items: [
        { label: 'Masters Degree', value: 'M.S. in Information Technology — Colorado Technical University, Denver, CO, 2017' },
        { label: 'Bachelors Degree', value: 'B.S. in Computer Science — Kakatiya Institute of Technology & Science, India, 2012' },
        { label: 'Location', value: 'St. Louis, MO' },
      ],
    },
  },
  {
    id: 'skills',
    name: 'Skills',
    subtitle: 'Gas Giant',
    type: 'gas',
    position: [6, 1, -8],
    radius: 1.4,
    rotationSpeed: 0.002,
    tilt: 0.05,
    colors: {
      primary: '#6b3fa0',
      secondary: '#e8c878',
      accent: '#3c1a68',
      atmosphere: '#b07ee8',
    },
    hasAtmosphere: true,
    hasClouds: false,
    hasRings: false,
    noiseScale: 5.0,
    cameraPosition: [9, 1.5, -4],
    cameraLookAt: [9, 1, -8],
    panelSide: 'right',
    content: {
      heading: 'Technical Skills',
      description:
        'Senior Full Stack .NET Developer with AI-first engineering expertise — from C#/.NET 8+ microservices and Angular/React frontends to LLM orchestration, cloud-native deployments, and enterprise-scale database design.',
      items: [
        { label: '.NET / C#', value: 'C#, ASP.NET Core MVC & Web API, .NET 8+, Entity Framework Core, ADO.NET, LINQ, WCF, WPF' },
        { label: 'Frontend', value: 'Angular (2–17), React.js, TypeScript, RxJS, NgRx, Redux, HTML5, CSS3, Bootstrap, Material UI' },
        { label: 'Databases', value: 'SQL Server, Oracle Database (PL/SQL), Azure SQL, PostgreSQL, MongoDB, Redis, Cosmos DB, DynamoDB' },
        { label: 'AI / LLM', value: 'OpenAI GPT-4, Anthropic Claude, LangChain, LangGraph, CrewAI, LlamaIndex, Hugging Face, LoRA/PEFT, MLflow, Azure AI/ML' },
        { label: 'Cloud & DevOps', value: 'Azure (AKS, Functions, AI Services, DevOps), AWS (EC2, Lambda, ECS/EKS, S3, RDS), Docker, Kubernetes, Helm' },
        { label: 'CI/CD & IaC', value: 'Azure DevOps, GitHub Actions, Jenkins, Terraform, Bicep, SonarQube, Git' },
        { label: 'Architecture', value: 'Microservices, Event-Driven (Kafka, RabbitMQ, Azure Service Bus), REST APIs, gRPC, DDD' },
        { label: 'Testing', value: 'xUnit, NUnit, Playwright, Selenium, Postman/Newman, k6' },
      ],
    },
  },
  {
    id: 'experience',
    name: 'Experience',
    subtitle: 'Ringed World',
    type: 'ice',
    position: [-5, -1, -16],
    radius: 1.3,
    rotationSpeed: 0.0018,
    tilt: 0.47,
    colors: {
      primary: '#1a3e7a',
      secondary: '#78c8f0',
      accent: '#d4ecf8',
      atmosphere: '#5098e0',
    },
    hasAtmosphere: true,
    hasClouds: false,
    hasRings: true,
    ringColor: '#7c9fd4',
    noiseScale: 6.0,
    cameraPosition: [-8, -0.5, -12.5],
    cameraLookAt: [-8, -1, -16],
    panelSide: 'left',
    content: {
      heading: 'Career Journey',
      description: 'Enterprise software engineering across Fortune 500 companies — from financial services to automotive and healthcare.',
      items: [
        { label: 'Anheuser-Busch InBev — St. Louis, MO', value: 'Lead Full Stack Developer — .NET / Angular / AI · Jun 2024 – Present' },
        { label: 'Tesla, Inc. — Fremont, CA', value: 'Senior Software Development Engineer / AI-ML Engineer · Jan 2023 – Jun 2024' },
        { label: "McDonald's Corporation — Chicago, IL", value: 'Senior .NET Developer — Cloud & Data · Sep 2021 – Dec 2022' },
        { label: 'Corteva Agriscience — Des Moines, IA', value: 'Senior .NET Developer — Cloud / Full Stack · Jun 2020 – Aug 2021' },
        { label: 'Centene Corporation — St. Louis, MO', value: 'Senior Software Application Engineer · Apr 2018 – May 2020' },
        { label: 'Southwest Airlines — Dallas, TX', value: 'Senior .NET Developer — Azure / DevOps · Jan 2017 – Mar 2018' },
        { label: 'Citizens Bank — Providence, RI', value: 'Senior .NET Developer · Mar 2016 – Dec 2016' },
      ],
    },
  },
  {
    id: 'projects',
    name: 'Projects',
    subtitle: 'Red Planet',
    type: 'rocky',
    position: [4, 2, -24],
    radius: 1.1,
    rotationSpeed: 0.0025,
    tilt: 0.44,
    colors: {
      primary: '#6e2e1c',
      secondary: '#c06030',
      accent: '#ff8040',
      atmosphere: '#d06838',
    },
    hasAtmosphere: true,
    hasClouds: false,
    hasRings: false,
    noiseScale: 8.0,
    cameraPosition: [7, 2.5, -20.5],
    cameraLookAt: [7, 2, -24],
    panelSide: 'right',
    content: {
      heading: 'Key Projects',
      description: 'AI-powered autonomous systems — from career automation and startup generation to gamified learning platforms.',
      items: [
        { label: 'AI Career Agent', value: 'FastAPI · Next.js · React Native · PostgreSQL · Qdrant · RabbitMQ · Docker · GPT-4o — Autonomous 28-microservice platform that crawls 5 job boards, AI-analyzes listings, generates tailored resumes, and auto-applies' },
        { label: 'Venture Builder (AI Startup Factory)', value: 'FastAPI · LM Studio · Qdrant · Python · Docker — Fully autonomous 19-step pipeline: discovers opportunities, validates ideas, builds MVPs, designs brands, creates pitch decks, deploys products, runs growth hacking, manages portfolio' },
        { label: 'Your AI Buddy', value: 'React · TypeScript · Supabase · Gemini · Groq — Gamified 30-day AI mastery platform with roadmap, AI coach, prompt factory, career hub, mock interviews, app builder, certifications, and leaderboard' },
        { label: 'Abhiverse (This Portfolio)', value: 'React Three Fiber · Groq API · GSAP · TypeScript · GLSL — 3D planetary portfolio with AI clone chatbot powered by Groq' },
      ],
    },
  },
  {
    id: 'contact',
    name: 'Contact',
    subtitle: 'Star',
    type: 'star',
    position: [-2, -0.5, -32],
    radius: 1.2,
    rotationSpeed: 0.001,
    tilt: 0,
    colors: {
      primary: '#ffb040',
      secondary: '#ff7028',
      accent: '#ffe880',
      atmosphere: '#ffb848',
    },
    hasAtmosphere: true,
    hasClouds: false,
    hasRings: false,
    noiseScale: 6.0,
    cameraPosition: [-5, 0, -29],
    cameraLookAt: [-5, -0.5, -32],
    panelSide: 'left',
    content: {
      heading: 'Get In Touch',
      description: "Open to new opportunities and collaborations. Let's build something great together.",
      items: [
        { label: 'Email', value: 'abhiramram0808@gmail.com', link: 'mailto:abhiramram0808@gmail.com' },
        { label: 'LinkedIn', value: 'linkedin.com/in/abhiram-s-21346b1b5', link: 'https://linkedin.com/in/abhiram-s-21346b1b5' },
        { label: 'GitHub', value: 'github.com/sriramojuabhiram', link: 'https://github.com/sriramojuabhiram' },
      ],
    },
  },
  {
    id: 'ai-clone',
    name: 'Abhi AI Clone',
    subtitle: 'Astronaut',
    type: 'nebula',
    position: [3, 0.5, -40],
    radius: 0.85,
    rotationSpeed: 0.0015,
    tilt: 0.2,
    colors: {
      primary: '#5b21b6',
      secondary: '#a78bfa',
      accent: '#67e8f9',
      atmosphere: '#7c3aed',
    },
    hasAtmosphere: true,
    hasClouds: true,
    hasRings: false,
    noiseScale: 5.0,
    cameraPosition: [3, 2.15, -35.8],
    cameraLookAt: [3, 1.2, -40],
    panelSide: 'right',
    content: {
      heading: 'Abhi AI Clone',
      description: 'Chat with Abhi AI clone — powered by Groq with open-source models, trained on my experience, skills, and professional background. Ask me anything.',
      items: [],
    },
  },
]
