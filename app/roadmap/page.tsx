'use client';

import FooterPattern from '@/app/components/global/FooterPattern';
import { useState } from 'react';

// Helper function to get random tilt values
const getRandomTilt = () => {
  const rotations = [-3, -2, 2, 3];
  const randomRotate = rotations[Math.floor(Math.random() * rotations.length)];
  const randomTranslateX = Math.random() * 4 - 2; // Random value between -2 and 2
  const randomTranslateY = Math.random() * 4 - 2; // Random value between -2 and 2
  return `rotate(${randomRotate}deg) translate(${randomTranslateX}px, ${randomTranslateY}px)`;
};

// Card component with hover effect
const RoadmapCard = ({ icon, text, bgColor = "bg-slate-800" }: any) => {
  const [hoverTransform, setHoverTransform] = useState("");

  return (
    <div
      className={`${bgColor} border-2 border-slate-600 brutal-shadow-left p-6 transform rotate-1 transition-transform duration-200 cursor-default rounded-lg`}
      style={{ 
        transform: hoverTransform || "rotate(1deg)",
      }}
      onMouseEnter={() => setHoverTransform(getRandomTilt())}
      onMouseLeave={() => setHoverTransform("")}
    >
      <span className="text-2xl mb-3 block">{icon}</span>
      <p className="font-freeman text-white">{text}</p>
    </div>
  );
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-slate-900 relative">
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="heading-text-2 text-7xl font-anton mb-6">
            ROADMAP
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="font-freeman text-xl mb-3 text-slate-300">
              Building the future of creator monetization, one milestone at a time.
            </p>
            <p className="font-freeman text-slate-400">
              We&apos;re committed to revolutionizing how creators monetize their digital assets. This isn&apos;t just a roadmap—it&apos;s our promise to the creator community.
            </p>
            <div className="mt-8 p-6 bg-red-900 border-2 border-red-600 brutal-shadow-left rounded-lg">
              <div className="flex items-start gap-4">
                
                <div>
                  <h3 className="font-anton text-xl mb-2 text-white"> <span className="text-3xl">⚔️</span> THE MIYAZAKI MISSION</h3>
                  <p className="font-freeman text-red-200">
                    We&apos;re building <b>PayVault</b> to right the wrongs in AI content creation. When ChatGPT went viral using Miyazaki&apos;s iconic Ghibli art style, the legendary creator never saw a penny. This stops now. Our platform ensures creators are properly compensated when AI systems train on or generate content inspired by their work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-24">
          {/* Phase 1 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-600"></div>
            <div className="neopop-gradient-primary border-2 border-slate-600 brutal-shadow-left p-4 mb-8 max-w-md rounded-lg">
              <h2 className="font-anton text-3xl text-white">PHASE 1: FOUNDATIONS</h2>
              <span className="inline-block mt-2 px-3 py-1 bg-slate-800 border-2 border-slate-600 brutal-shadow-center font-freeman text-sm text-white rounded">
                COMPLETED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ml-8">
              <RoadmapCard 
                icon="✅"
                text="Creator-first file vault with easy uploads and pricing"
                bgColor="bg-green-900"
              />
              <RoadmapCard 
                icon="✅"
                text="Marketplace UI for buyers to discover and pay"
                bgColor="bg-green-900"
              />
              <RoadmapCard 
                icon="✅"
                text="Integrated x402 microtransaction rails"
                bgColor="bg-green-900"
              />
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-600"></div>
            <div className="neopop-gradient-primary border-2 border-slate-600 brutal-shadow-left p-4 mb-8 max-w-md rounded-lg">
              <h2 className="font-anton text-3xl text-white">PHASE 2: CORE INFRASTRUCTURE</h2>
              <span className="inline-block mt-2 px-3 py-1 bg-slate-800 border-2 border-slate-600 brutal-shadow-center font-freeman text-sm text-white rounded">
                NOW → Q3 2025
              </span>
              <p className="font-freeman mt-3 text-slate-200">Make PayVault interoperable, scalable, and agent-friendly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ml-8">
              <RoadmapCard 
                icon="🔄"
                text="Deploy MCP on scalable infra"
                bgColor="bg-amber-900"
              />
              <RoadmapCard 
                icon="⚙️"
                text="Launch Public AI API access"
                bgColor="bg-amber-900"
              />
              <RoadmapCard 
                icon="🧠"
                text="Enable Auto-Responder Agents"
                bgColor="bg-amber-900"
              />
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-600"></div>
            <div className="neopop-gradient-primary border-2 border-slate-600 brutal-shadow-left p-4 mb-8 max-w-md rounded-lg">
              <h2 className="font-anton text-3xl text-white">PHASE 3: NETWORK EXPANSION</h2>
              <span className="inline-block mt-2 px-3 py-1 bg-slate-800 border-2 border-slate-600 brutal-shadow-center font-freeman text-sm text-white rounded">
                Q4 2025
              </span>
              <p className="font-freeman mt-3 text-slate-200">Expand from file vault → creator economy protocol.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ml-8">
              <RoadmapCard 
                icon="💰"
                text="Enable resale + royalties on secondary sales"
              />
              <RoadmapCard 
                icon="🛒"
                text="Launch Collections with dynamic pricing"
              />
              <RoadmapCard 
                icon="🔄"
                text="Build Content Curator Leaderboards"
              />
            </div>
          </div>

          {/* Phase 4 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-600"></div>
            <div className="neopop-gradient-primary border-2 border-slate-600 brutal-shadow-left p-4 mb-8 max-w-md rounded-lg">
              <h2 className="font-anton text-3xl text-white">PHASE 4: AGENT-POWERED</h2>
              <span className="inline-block mt-2 px-3 py-1 bg-slate-800 border-2 border-slate-600 brutal-shadow-center font-freeman text-sm text-white rounded">
                Q1–Q2 2026
              </span>
              <p className="font-freeman mt-3 text-slate-200">AI-first ecosystem where agents earn, create, and curate autonomously.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ml-8">
              <RoadmapCard 
                icon="🔍"
                text="Open MCP-wide Search API"
              />
              <RoadmapCard 
                icon="🧬"
                text="Autonomous Curator Bots"
              />
              <RoadmapCard 
                icon="🧠"
                text="Training-as-a-Service"
              />
            </div>
          </div>

          {/* Phase 5 */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-600"></div>
            <div className="neopop-gradient-primary border-2 border-slate-600 brutal-shadow-left p-4 mb-8 max-w-md rounded-lg">
              <h2 className="font-anton text-3xl text-white">PHASE 5: THE PROTOCOL ERA</h2>
              <span className="inline-block mt-2 px-3 py-1 bg-slate-800 border-2 border-slate-600 brutal-shadow-center font-freeman text-sm text-white rounded">
                Late 2026+
              </span>
              <p className="font-freeman mt-3 text-slate-200">Become the protocol layer for creator monetization in the AI age.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ml-8">
              <RoadmapCard 
                icon="📦"
                text="Launch PayVault SDK"
              />
              <RoadmapCard 
                icon="🌐"
                text="Multi-vault agent ecosystem"
              />
              <RoadmapCard 
                icon="🏗️"
                text="Enterprise expansion"
              />
            </div>
          </div>
        </div>
      </main>
      <FooterPattern design={1} className='w-[80vw] bottom-0 right-0 opacity-30' />
      <FooterPattern design={1} className='w-[80vw] top-0 left-0 -scale-100 opacity-30' />
    </div>
  );
}