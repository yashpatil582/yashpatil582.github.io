import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { ChatCta } from "@/components/sections/chat-cta";
import { RepoAgentCta } from "@/components/sections/repo-agent-cta";
import { EvalCta } from "@/components/sections/eval-cta";
import { AgentSkills } from "@/components/sections/agent-skills";
import { Skills } from "@/components/sections/skills";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <ChatCta />
      <RepoAgentCta />
      <EvalCta />
      <AgentSkills />
      <Skills />
      <Contact />
    </>
  );
}
