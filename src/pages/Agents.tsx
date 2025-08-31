import { useState, useEffect } from 'react';
import { Search, Filter, Users, Zap, Code, Palette, Calendar, Settings, TestTube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { agents, departments, type Agent, type Department } from '@/data/agentsIndex';

const departmentIcons = {
  'Engineering': Code,
  'Product': Users,
  'Marketing': Zap,
  'Design': Palette,
  'Project Management': Calendar,
  'Studio Operations': Settings,
  'Testing': TestTube,
  'Bonus': Zap
};

const departmentColors = {
  'Engineering': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Product': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Marketing': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Design': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  'Project Management': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Studio Operations': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'Testing': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Bonus': 'bg-red-500/10 text-red-500 border-red-500/20'
};

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentContent, setAgentContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || agent.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const loadAgentContent = async (agent: Agent) => {
    setIsLoading(true);
    try {
      const response = await fetch(agent.filePath);
      const content = await response.text();
      setAgentContent(content);
      setSelectedAgent(agent);
    } catch (error) {
      console.error('Failed to load agent content:', error);
      setAgentContent('Failed to load agent content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const AgentCard = ({ agent }: { agent: Agent }) => {
    const DeptIcon = departmentIcons[agent.department as keyof typeof departmentIcons];
    
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-muted/50 bg-card/50 backdrop-blur-sm btn-touch"
        onClick={() => loadAgentContent(agent)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground">{agent.name}</CardTitle>
            <DeptIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {agent.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <Badge 
              variant="outline" 
              className={`text-xs ${departmentColors[agent.department as keyof typeof departmentColors]} flex-shrink-0`}
            >
              {agent.department}
            </Badge>
            <div className="flex flex-wrap gap-1">
              {agent.tools.slice(0, 3).map((tool, index) => (
                <span key={index} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  {tool}
                </span>
              ))}
              {agent.tools.length > 3 && (
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  +{agent.tools.length - 3}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto container-mobile py-4 sm:py-6">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="heading-responsive font-bold text-foreground mb-2">
              AI Agents Collection
            </h1>
            <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto">
              Specialized AI agents designed to accelerate every aspect of rapid development
            </p>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/80 border-muted/50 btn-touch"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value as Department | 'all')}>
              <SelectTrigger className="w-full sm:w-48 bg-background/80 border-muted/50 btn-touch">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="All Departments" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="container mx-auto container-mobile py-6 sm:py-8">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
            {selectedDepartment !== 'all' && ` in ${selectedDepartment}`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No agents found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedAgent && (
                <>
                  {(() => {
                    const DeptIcon = departmentIcons[selectedAgent.department as keyof typeof departmentIcons];
                    return <DeptIcon className="h-6 w-6" />;
                  })()}
                  {selectedAgent.name}
                  <Badge 
                    variant="outline" 
                    className={`${departmentColors[selectedAgent.department as keyof typeof departmentColors]}`}
                  >
                    {selectedAgent.department}
                  </Badge>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedAgent?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 text-muted-foreground leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-3 text-muted-foreground">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 text-muted-foreground">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>,
                    pre: ({ children }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono text-foreground">{children}</pre>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">{children}</blockquote>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>
                  }}
                >
                  {agentContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}