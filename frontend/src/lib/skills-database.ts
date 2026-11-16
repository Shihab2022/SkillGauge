/** Categorised technology & skill database for search-as-you-type suggestions. */

export interface SkillCategory {
  category: string;
  skills: string[];
}

export const SKILLS_DATABASE: SkillCategory[] = [
  {
    category: "Frontend",
    skills: [
      "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SvelteKit",
      "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap",
      "Material UI", "Shadcn UI", "Chakra UI", "Ant Design", "Styled Components",
      "Emotion", "Sass", "Less", "PostCSS", "Webpack", "Vite", "Parcel", "Rollup",
      "Storybook", "Remix", "Astro", "Gatsby", "React Native", "Expo",
      "Three.js", "D3.js", "Chart.js", "Recharts", "framer-motion", "GSAP",
      "Redux", "Zustand", "Jotai", "Recoil", "MobX", "Pinia", "Vuex",
      "React Query", "SWR", "Apollo Client", "Urql", "tRPC",
      "Jest", "Vitest", "Cypress", "Playwright", "Testing Library",
      "Storybook", "Chromatic", "ESLint", "Prettier", "Turborepo",
    ],
  },
  {
    category: "Backend",
    skills: [
      "Node.js", "Express.js", "Fastify", "NestJS", "Koa", "Hapi",
      "Python", "Django", "FastAPI", "Flask", "SQLAlchemy", "Pydantic",
      "Java", "Spring Boot", "Spring MVC", "Hibernate", "Maven", "Gradle",
      "Go", "Gin", "Echo", "Fiber", "GORM",
      "Rust", "Actix", "Axum", "Tokio",
      "C#", ".NET", "ASP.NET Core", "Entity Framework", "SignalR",
      "PHP", "Laravel", "Symfony", "WordPress",
      "Ruby", "Ruby on Rails", "Sinatra",
      "Elixir", "Phoenix", "Ecto",
      "GraphQL", "REST API", "gRPC", "WebSockets", "WebRTC",
      "JWT", "OAuth 2.0", "OpenID Connect", "SAML",
      "Microservices", "Event-Driven Architecture", "CQRS", "DDD",
    ],
  },
  {
    category: "Database",
    skills: [
      "PostgreSQL", "MySQL", "SQLite", "Microsoft SQL Server", "Oracle",
      "MongoDB", "Redis", "Cassandra", "CockroachDB", "DynamoDB", "FaunaDB",
      "Elasticsearch", "OpenSearch", "Meilisearch", "Typesense",
      "Prisma", "Drizzle", "TypeORM", "Sequelize", "Knex.js",
      "Neo4j", "ArangoDB", "InfluxDB", "TimescaleDB",
      "Supabase", "PlanetScale", "Neon", "Railway", "Turso",
      "SQL", "NoSQL", "ACID", "Database Design", "Query Optimization",
      "Database Migrations", "Replication", "Sharding",
    ],
  },
  {
    category: "Cloud & DevOps",
    skills: [
      "AWS", "Amazon EC2", "Amazon S3", "AWS Lambda", "Amazon EKS",
      "Amazon RDS", "Amazon DynamoDB", "Amazon SQS", "Amazon SNS",
      "Amazon CloudFront", "AWS IAM", "AWS CDK", "AWS SAM",
      "Azure", "Azure DevOps", "Azure Kubernetes Service", "Azure Functions",
      "Google Cloud Platform", "GCP", "Google Cloud Run", "Google Cloud Functions",
      "Firebase", "Vercel", "Netlify", "Railway", "Render", "Fly.io", "Heroku",
      "Docker", "Kubernetes", "Helm", "Kustomize", "Terraform", "Pulumi",
      "Ansible", "Chef", "Puppet", "Vagrant",
      "GitHub Actions", "GitLab CI", "Jenkins", "CircleCI", "Travis CI",
      "ArgoCD", "Flux", "Spinnaker", "Tekton",
      "Prometheus", "Grafana", "Datadog", "New Relic", "Sentry", "PagerDuty",
      "Nginx", "Apache", "Traefik", "Istio", "Linkerd",
      "Linux", "Bash", "Shell Scripting", "PowerShell",
      "CI/CD", "Infrastructure as Code", "GitOps", "SRE", "DevSecOps",
    ],
  },
  {
    category: "Mobile",
    skills: [
      "React Native", "Expo", "Flutter", "Dart", "Swift", "SwiftUI",
      "Objective-C", "Kotlin", "Java Android", "Jetpack Compose",
      "Ionic", "Capacitor", "Xamarin", "MAUI",
      "Firebase", "RevenueCat", "Stripe Mobile", "Apple Pay", "Google Pay",
      "App Store Connect", "Google Play Console",
      "Push Notifications", "Deep Linking", "In-App Purchases",
      "AsyncStorage", "SQLite Mobile", "Realm", "CoreData",
      "Detox", "Espresso", "XCTest",
    ],
  },
  {
    category: "AI & Machine Learning",
    skills: [
      "Python", "NumPy", "Pandas", "Scikit-learn", "Matplotlib", "Seaborn",
      "TensorFlow", "Keras", "PyTorch", "JAX", "MXNet",
      "OpenAI API", "Langchain", "LlamaIndex", "Haystack",
      "Hugging Face Transformers", "ONNX", "MLflow", "DVC",
      "NLP", "Computer Vision", "Object Detection", "Image Segmentation",
      "LLM Fine-tuning", "Prompt Engineering", "RAG", "Vector Databases",
      "Pinecone", "Chroma", "Weaviate", "Qdrant", "FAISS",
      "OpenCV", "Pillow", "Albumentations",
      "Apache Spark", "PySpark", "Databricks", "Hadoop",
      "Airflow", "Prefect", "Luigi", "Kubeflow",
      "A/B Testing", "Statistical Analysis", "Data Visualization",
      "Feature Engineering", "Model Deployment", "RLHF",
    ],
  },
  {
    category: "Data Engineering",
    skills: [
      "SQL", "dbt", "Apache Kafka", "Apache Flink", "Apache Airflow",
      "Apache Spark", "PySpark", "Databricks", "Snowflake", "BigQuery",
      "Amazon Redshift", "Azure Synapse", "Hadoop", "Hive", "Presto",
      "Trino", "dbt", "Fivetran", "Airbyte", "Stitch",
      "ETL", "ELT", "Data Pipelines", "Data Warehousing", "Data Lakehouse",
      "Delta Lake", "Apache Iceberg", "Apache Hudi",
      "Tableau", "Power BI", "Looker", "Metabase", "Superset",
      "Great Expectations", "Pandera", "Data Quality", "Data Governance",
    ],
  },
  {
    category: "Security",
    skills: [
      "Cybersecurity", "Penetration Testing", "OWASP", "Network Security",
      "Application Security", "Cloud Security", "Zero Trust",
      "Encryption", "PKI", "TLS/SSL", "OAuth", "RBAC", "ABAC",
      "SIEM", "SOC", "Threat Intelligence", "Vulnerability Assessment",
      "Burp Suite", "Metasploit", "Wireshark", "Nmap",
      "AWS Security Hub", "Azure Sentinel", "CrowdStrike", "SentinelOne",
      "Compliance", "ISO 27001", "SOC 2", "GDPR", "HIPAA",
      "Secure Code Review", "Security Auditing", "Red Teaming", "Blue Teaming",
    ],
  },
  {
    category: "Testing & QA",
    skills: [
      "Jest", "Vitest", "Mocha", "Chai", "Jasmine",
      "Cypress", "Playwright", "Selenium", "WebdriverIO",
      "Puppeteer", "k6", "Artillery", "JMeter",
      "Testing Library", "React Testing Library", "Enzyme",
      "JUnit", "TestNG", "Mockito", "Spring Test",
      "PyTest", "Unittest", "Factory Boy", "Faker",
      "Test-Driven Development", "BDD", "Integration Testing",
      "End-to-End Testing", "Performance Testing", "Load Testing",
      "Accessibility Testing", "Visual Regression Testing",
    ],
  },
  {
    category: "Architecture & Design",
    skills: [
      "System Design", "Microservices", "Monolith", "Serverless",
      "Event-Driven Architecture", "CQRS", "Event Sourcing",
      "Domain-Driven Design", "Clean Architecture", "Hexagonal Architecture",
      "API Design", "RESTful API", "GraphQL API", "gRPC",
      "Message Queues", "RabbitMQ", "Apache Kafka", "AWS SQS",
      "Caching Strategies", "CDN", "Load Balancing",
      "Design Patterns", "SOLID Principles", "12-Factor App",
      "High Availability", "Fault Tolerance", "Disaster Recovery",
      "Scalability", "Performance Optimization", "Technical Debt Management",
    ],
  },
  {
    category: "Tools & Collaboration",
    skills: [
      "Git", "GitHub", "GitLab", "Bitbucket",
      "Jira", "Linear", "Notion", "Confluence", "Trello", "Asana",
      "Slack", "Microsoft Teams", "Zoom", "Figma",
      "VS Code", "IntelliJ IDEA", "PyCharm", "Xcode", "Android Studio",
      "Postman", "Insomnia", "Swagger", "OpenAPI",
      "Linux", "macOS", "Windows", "WSL",
      "Agile", "Scrum", "Kanban", "SAFe",
      "Code Review", "Pair Programming", "Technical Writing", "Documentation",
    ],
  },
];

/** All skill names flattened into one array (deduplicated). */
export const ALL_SKILLS: string[] = Array.from(
  new Set(SKILLS_DATABASE.flatMap((c) => c.skills))
);

/** Fuzzy search skills matching the query. Returns up to `limit` results. */
export function searchSkills(query: string, limit = 15): string[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const exact: string[] = [];
  const startsWith: string[] = [];
  const contains: string[] = [];

  for (const skill of ALL_SKILLS) {
    const lower = skill.toLowerCase();
    if (lower === q) exact.push(skill);
    else if (lower.startsWith(q)) startsWith.push(skill);
    else if (lower.includes(q)) contains.push(skill);
  }

  return [...exact, ...startsWith, ...contains].slice(0, limit);
}
