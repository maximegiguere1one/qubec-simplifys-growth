export interface Agent {
  id: string;
  name: string;
  description: string;
  department: string;
  color: string;
  tools: string[];
  filePath: string;
}

export const departments = [
  'Engineering',
  'Product', 
  'Marketing',
  'Design',
  'Project Management',
  'Studio Operations',
  'Testing',
  'Bonus'
] as const;

export type Department = typeof departments[number];

export const agents: Agent[] = [
  // Engineering
  {
    id: 'ai-engineer',
    name: 'AI Engineer',
    description: 'Integrate AI/ML features that actually ship',
    department: 'Engineering',
    color: 'blue',
    tools: ['Write', 'Read', 'MultiEdit', 'Bash', 'Grep'],
    filePath: '/agents/ai-engineer.md'
  },
  {
    id: 'backend-architect',
    name: 'Backend Architect', 
    description: 'Design scalable APIs and server systems',
    department: 'Engineering',
    color: 'indigo',
    tools: ['Write', 'Read', 'MultiEdit', 'Bash'],
    filePath: '/agents/backend-architect.md'
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    description: 'Build blazing-fast user interfaces', 
    department: 'Engineering',
    color: 'blue',
    tools: ['Write', 'Read', 'MultiEdit', 'Bash', 'Grep', 'Glob'],
    filePath: '/agents/frontend-developer.md'
  },
  {
    id: 'mobile-app-builder',
    name: 'Mobile App Builder',
    description: 'Create native iOS/Android experiences',
    department: 'Engineering', 
    color: 'purple',
    tools: ['Write', 'Read', 'MultiEdit', 'Bash'],
    filePath: '/agents/mobile-app-builder.md'
  },
  {
    id: 'rapid-prototyper',
    name: 'Rapid Prototyper',
    description: 'Build MVPs in days, not weeks',
    department: 'Engineering',
    color: 'green',
    tools: ['Write', 'Read', 'MultiEdit', 'Bash', 'Grep'],
    filePath: '/agents/rapid-prototyper.md'
  },
  {
    id: 'devops-automator',
    name: 'DevOps Automator',
    description: 'Deploy continuously without breaking things',
    department: 'Engineering',
    color: 'red',
    tools: ['Write', 'Read', 'Bash'],
    filePath: '/agents/devops-automator.md'
  },
  {
    id: 'test-writer-fixer',
    name: 'Test Writer Fixer',
    description: 'Write tests that catch real bugs',
    department: 'Engineering',
    color: 'yellow',
    tools: ['Write', 'Read', 'MultiEdit', 'Bash'],
    filePath: '/agents/test-writer-fixer.md'
  },
  // Product
  {
    id: 'trend-researcher',
    name: 'Trend Researcher',
    description: 'Identify viral opportunities',
    department: 'Product',
    color: 'purple',
    tools: ['Write', 'Read'],
    filePath: '/agents/trend-researcher.md'
  },
  {
    id: 'feedback-synthesizer',
    name: 'Feedback Synthesizer',
    description: 'Transform complaints into features',
    department: 'Product',
    color: 'blue',
    tools: ['Write', 'Read'],
    filePath: '/agents/feedback-synthesizer.md'
  },
  {
    id: 'sprint-prioritizer',
    name: 'Sprint Prioritizer',
    description: 'Ship maximum value in 6 days',
    department: 'Product',
    color: 'green',
    tools: ['Write', 'Read'],
    filePath: '/agents/sprint-prioritizer.md'
  },
  // Marketing
  {
    id: 'growth-hacker',
    name: 'Growth Hacker',
    description: 'Find and exploit viral growth loops',
    department: 'Marketing',
    color: 'green',
    tools: ['Write', 'Read'],
    filePath: '/agents/growth-hacker.md'
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Generate content across all platforms',
    department: 'Marketing',
    color: 'purple',
    tools: ['Write', 'Read'],
    filePath: '/agents/content-creator.md'
  },
  {
    id: 'instagram-curator',
    name: 'Instagram Curator',
    description: 'Master the visual content game',
    department: 'Marketing',
    color: 'pink',
    tools: ['Write', 'Read'],
    filePath: '/agents/instagram-curator.md'
  },
  {
    id: 'tiktok-strategist',
    name: 'TikTok Strategist',
    description: 'Create shareable marketing moments',
    department: 'Marketing',
    color: 'red',
    tools: ['Write', 'Read'],
    filePath: '/agents/tiktok-strategist.md'
  },
  {
    id: 'twitter-engager',
    name: 'Twitter Engager',
    description: 'Ride trends to viral engagement',
    department: 'Marketing',
    color: 'blue',
    tools: ['Write', 'Read'],
    filePath: '/agents/twitter-engager.md'
  },
  {
    id: 'reddit-community-builder',
    name: 'Reddit Community Builder',
    description: 'Win Reddit without being banned',
    department: 'Marketing',
    color: 'orange',
    tools: ['Write', 'Read'],
    filePath: '/agents/reddit-community-builder.md'
  },
  {
    id: 'app-store-optimizer',
    name: 'App Store Optimizer',
    description: 'Dominate app store search results',
    department: 'Marketing',
    color: 'blue',
    tools: ['Write', 'Read'],
    filePath: '/agents/app-store-optimizer.md'
  },
  // Design
  {
    id: 'ui-designer',
    name: 'UI Designer',
    description: 'Design interfaces developers can actually build',
    department: 'Design',
    color: 'purple',
    tools: ['Write', 'Read'],
    filePath: '/agents/ui-designer.md'
  },
  {
    id: 'ux-researcher',
    name: 'UX Researcher',
    description: 'Turn user insights into product improvements',
    department: 'Design',
    color: 'blue',
    tools: ['Write', 'Read'],
    filePath: '/agents/ux-researcher.md'
  },
  {
    id: 'brand-guardian',
    name: 'Brand Guardian',
    description: 'Keep visual identity consistent everywhere',
    department: 'Design',
    color: 'indigo',
    tools: ['Write', 'Read'],
    filePath: '/agents/brand-guardian.md'
  },
  {
    id: 'visual-storyteller',
    name: 'Visual Storyteller',
    description: 'Create visuals that convert and share',
    department: 'Design',
    color: 'green',
    tools: ['Write', 'Read'],
    filePath: '/agents/visual-storyteller.md'
  },
  {
    id: 'whimsy-injector',
    name: 'Whimsy Injector',
    description: 'Add delight to every interaction',
    department: 'Design',
    color: 'pink',
    tools: ['Write', 'Read'],
    filePath: '/agents/whimsy-injector.md'
  },
  // Project Management
  {
    id: 'project-shipper',
    name: 'Project Shipper',
    description: 'Launch products that don\'t crash',
    department: 'Project Management',
    color: 'green',
    tools: ['Write', 'Read'],
    filePath: '/agents/project-shipper.md'
  },
  {
    id: 'studio-producer',
    name: 'Studio Producer',
    description: 'Keep teams shipping, not meeting',
    department: 'Project Management',
    color: 'purple',
    tools: ['Write', 'Read'],
    filePath: '/agents/studio-producer.md'
  },
  {
    id: 'experiment-tracker',
    name: 'Experiment Tracker',
    description: 'Data-driven feature validation',
    department: 'Project Management',
    color: 'blue',
    tools: ['Write', 'Read'],
    filePath: '/agents/experiment-tracker.md'
  },
  // Studio Operations
  {
    id: 'analytics-reporter',
    name: 'Analytics Reporter',
    description: 'Turn data into actionable insights',
    department: 'Studio Operations',
    color: 'blue',
    tools: ['Write', 'Read'],
    filePath: '/agents/analytics-reporter.md'
  },
  {
    id: 'finance-tracker',
    name: 'Finance Tracker',
    description: 'Keep the studio profitable',
    department: 'Studio Operations',
    color: 'green',
    tools: ['Write', 'Read'],
    filePath: '/agents/finance-tracker.md'
  },
  {
    id: 'infrastructure-maintainer',
    name: 'Infrastructure Maintainer',
    description: 'Scale without breaking the bank',
    department: 'Studio Operations',
    color: 'indigo',
    tools: ['Write', 'Read'],
    filePath: '/agents/infrastructure-maintainer.md'
  },
  {
    id: 'legal-compliance-checker',
    name: 'Legal Compliance Checker',
    description: 'Stay legal while moving fast',
    department: 'Studio Operations',
    color: 'red',
    tools: ['Write', 'Read'],
    filePath: '/agents/legal-compliance-checker.md'
  },
  {
    id: 'support-responder',
    name: 'Support Responder',
    description: 'Turn angry users into advocates',
    department: 'Studio Operations',
    color: 'yellow',
    tools: ['Write', 'Read'],
    filePath: '/agents/support-responder.md'
  },
  // Testing
  {
    id: 'api-tester',
    name: 'API Tester',
    description: 'Ensure APIs work under pressure',
    department: 'Testing',
    color: 'red',
    tools: ['Write', 'Read', 'Bash'],
    filePath: '/agents/api-tester.md'
  },
  {
    id: 'performance-benchmarker',
    name: 'Performance Benchmarker',
    description: 'Make everything faster',
    department: 'Testing',
    color: 'yellow',
    tools: ['Write', 'Read', 'Bash'],
    filePath: '/agents/performance-benchmarker.md'
  },
  {
    id: 'test-results-analyzer',
    name: 'Test Results Analyzer',
    description: 'Find patterns in test failures',
    department: 'Testing',
    color: 'purple',
    tools: ['Write', 'Read'],
    filePath: '/agents/test-results-analyzer.md'
  },
  {
    id: 'tool-evaluator',
    name: 'Tool Evaluator',
    description: 'Choose tools that actually help',
    department: 'Testing',
    color: 'blue',
    tools: ['Write', 'Read'],
    filePath: '/agents/tool-evaluator.md'
  },
  {
    id: 'workflow-optimizer',
    name: 'Workflow Optimizer',
    description: 'Eliminate workflow bottlenecks',
    department: 'Testing',
    color: 'green',
    tools: ['Write', 'Read'],
    filePath: '/agents/workflow-optimizer.md'
  }
];

export const getAgentsByDepartment = (department: Department) => 
  agents.filter(agent => agent.department === department);

export const getAgentById = (id: string) => 
  agents.find(agent => agent.id === id);

export const searchAgents = (query: string) => 
  agents.filter(agent => 
    agent.name.toLowerCase().includes(query.toLowerCase()) ||
    agent.description.toLowerCase().includes(query.toLowerCase())
  );