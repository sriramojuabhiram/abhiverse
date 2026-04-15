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
    items: Array<{ label: string; value: string }>
  }
}

export const planets: PlanetSection[] = [
  {
    id: 'about',
    name: 'About',
    subtitle: 'Home World',
    type: 'earth',
    position: [0, 0, 0],
    radius: 1.5,
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
    cameraPosition: [0, 0.5, 5],
    cameraLookAt: [0, 0, 0],
    panelSide: 'left',
    content: {
      heading: 'About Me',
      description:
        'Results-driven AI Software Engineer with 10+ years of enterprise software experience and deep expertise in designing, building, and deploying production-grade AI systems. Proven track record architecting agentic workflows, multi-agent orchestration systems, and LLM-powered automation using LangChain, LangGraph, CrewAI, and AutoGen. Proficient in Python, Go, and Java with strong foundations in microservices, event-driven architecture, and cloud-native deployments on AWS, GCP, and Azure.',
      items: [
        { label: 'Education', value: 'B.Tech Computer Science — Vaagdevi College of Engineering, Warangal, 2013' },
        { label: 'Location', value: "O'Fallon, MO (Remote)" },
      ],
    },
  },
  {
    id: 'skills',
    name: 'Skills',
    subtitle: 'Gas Giant',
    type: 'gas',
    position: [6, 1, -8],
    radius: 1.8,
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
    cameraPosition: [6, 1.5, -3.5],
    cameraLookAt: [6, 1, -8],
    panelSide: 'right',
    content: {
      heading: 'Technical Skills',
      description:
        'AI-first full-stack engineering — from agentic workflows and LLM orchestration to production microservices, cloud-native deployments, and modern frontends.',
      items: [
        { label: 'AI & Agentic', value: 'LangChain, LangGraph, CrewAI, AutoGen, LlamaIndex, OpenAI API, Claude API, RAG, FAISS, ChromaDB' },
        { label: 'ML & MLOps', value: 'PyTorch, TensorFlow, Scikit-learn, MLflow, Weights & Biases, Vertex AI, Apache Spark' },
        { label: 'Backend & APIs', value: 'Python, FastAPI, Django, Flask, Go, Java 17+ / Spring Boot, Node.js, ASP.NET Core, GraphQL, gRPC' },
        { label: 'Frontend & UI', value: 'React.js, Angular, Vue.js, Next.js, TypeScript, HTML5, CSS3, Material UI, Three.js' },
        { label: 'Cloud & DevOps', value: 'AWS (ECS, EKS, Lambda, S3, RDS), GCP (Cloud Run, BigQuery, Vertex AI), Azure, Docker, Kubernetes, Terraform, GitHub Actions' },
        { label: 'Databases', value: 'PostgreSQL, MySQL, MongoDB, DynamoDB, Redis, Aurora, Cassandra, FAISS, ChromaDB' },
      ],
    },
  },
  {
    id: 'experience',
    name: 'Experience',
    subtitle: 'Ringed World',
    type: 'ice',
    position: [-5, -1, -16],
    radius: 1.5,
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
    cameraPosition: [-5, -0.5, -12],
    cameraLookAt: [-5, -1, -16],
    panelSide: 'left',
    content: {
      heading: 'Career Journey',
      description: 'Enterprise software engineering across Fortune 500 companies — from financial services to automotive and healthcare.',
      items: [
        { label: 'Anheuser-Busch — St. Louis, MO', value: 'Senior .NET Full Stack Developer · Jun 2024 – Present' },
        { label: 'Tesla, Inc. — Fremont, CA', value: 'Senior .NET Developer · Jan 2023 – Jun 2024' },
        { label: "McDonald's — Chicago, IL", value: 'Senior .NET Developer · Sep 2021 – Dec 2022' },
        { label: 'Corteva Agriscience — Des Moines, IA', value: 'Senior .NET Developer · Jun 2020 – Aug 2021' },
        { label: 'Centene Corporation — St. Louis, MO', value: 'Senior Application Software Engineer · Apr 2018 – May 2020' },
        { label: 'Southwest Airlines — Dallas, TX', value: 'Sr. .NET Developer · Jan 2017 – Mar 2018' },
        { label: 'Citizens Bank — Providence, RI', value: 'Sr. .NET Developer · Mar 2016 – Dec 2016' },
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
    cameraPosition: [4, 2.5, -20],
    cameraLookAt: [4, 2, -24],
    panelSide: 'right',
    content: {
      heading: 'Key Projects',
      description: 'AI-powered autonomous systems — from career automation and startup generation to gamified learning platforms.',
      items: [
        { label: 'AI Career Agent', value: 'FastAPI · Next.js · React Native · PostgreSQL · Qdrant · RabbitMQ · Docker · GPT-4o — Autonomous 28-microservice platform that crawls 5 job boards, AI-analyzes listings, generates tailored resumes, and auto-applies' },
        { label: 'Venture Builder (AI Startup Factory)', value: 'FastAPI · LM Studio · Qdrant · Python · Docker — Fully autonomous 19-step pipeline: discovers opportunities, validates ideas, builds MVPs, designs brands, creates pitch decks, deploys products, runs growth hacking, manages portfolio' },
        { label: 'Your AI Buddy', value: 'React · TypeScript · Supabase · Gemini · Groq — Gamified 30-day AI mastery platform with roadmap, AI coach, prompt factory, career hub, mock interviews, app builder, certifications, and leaderboard' },
        { label: 'Neural Nexus (This Portfolio)', value: 'React Three Fiber · Claude API · GSAP · TypeScript · GLSL — 3D planetary portfolio with AI clone chatbot powered by Groq' },
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
    cameraPosition: [-2, 0, -28.5],
    cameraLookAt: [-2, -0.5, -32],
    panelSide: 'left',
    content: {
      heading: 'Get In Touch',
      description: "Open to new opportunities and collaborations. Let's build something great together.",
      items: [
        { label: 'Email', value: 'abhiramram0808@gmail.com' },
        { label: 'LinkedIn', value: 'linkedin.com/in/abhiram-s-21346b1b5' },
        { label: 'GitHub', value: 'github.com/sriramojuabhiram' },
      ],
    },
  },
  {
    id: 'ai-clone',
    name: 'Abhi AI Clone',
    subtitle: 'Astronaut',
    type: 'nebula',
    position: [3, 0.5, -40],
    radius: 1.4,
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
