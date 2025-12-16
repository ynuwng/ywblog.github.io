import { Github, Linkedin, Mail } from 'lucide-react';
import React from 'react';
import { XIcon } from './XIcon';

interface BlogHeaderProps {
  onNavigate: (view: 'home' | 'archives' | 'categories' | 'tags' | 'about' | 'article' | 'tagged' | 'category') => void;
  currentView: 'home' | 'archives' | 'categories' | 'tags' | 'about' | 'article' | 'tagged' | 'category';
}

export function BlogHeader({ onNavigate, currentView }: BlogHeaderProps) {
  const isArticleView = currentView === 'article' || currentView === 'tagged' || currentView === 'category';
  
  return (
    <header className="border-b border-gray-200">
      <div className={`max-w-3xl mx-auto px-6 py-12`}>
        <div className={isArticleView ? 'hidden' : ''}>
          <style>{`
            @keyframes scroll-led {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-25%);
              }
            }
            .led-scroll-container {
              animation: scroll-led 20s linear infinite;
            }
            .led-scroll-container:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="overflow-hidden mb-2 relative">
            <div className="led-scroll-container inline-flex whitespace-nowrap">
              <pre className="text-[6px] sm:text-[8px] md:text-[10px] leading-[1] font-mono inline-block">
{`██    ██ ██    ██  █████  ███    ██     ██     ██  █████  ███    ██  ██████       
 ██  ██  ██    ██ ██   ██ ████   ██     ██     ██ ██   ██ ████   ██ ██            
  ████   ██    ██ ███████ ██ ██  ██     ██  █  ██ ███████ ██ ██  ██ ██   ███      
   ██    ██    ██ ██   ██ ██  ██ ██     ██ ███ ██ ██   ██ ██  ██ ██ ██    ██      
   ██     ██████  ██   ██ ██   ████      ███ ███  ██   ██ ██   ████  ██████       `}
              </pre>
              <pre className="text-[6px] sm:text-[8px] md:text-[10px] leading-[1] font-mono inline-block" aria-hidden="true">
{`██    ██ ██    ██  █████  ███    ██     ██     ██  █████  ███    ██  ██████       
 ██  ██  ██    ██ ██   ██ ████   ██     ██     ██ ██   ██ ████   ██ ██            
  ████   ██    ██ ███████ ██ ██  ██     ██  █  ██ ███████ ██ ██  ██ ██   ███      
   ██    ██    ██ ██   ██ ██  ██ ██     ██ ███ ██ ██   ██ ██  ██ ██ ██    ██      
   ██     ██████  ██   ██ ██   ████      ███ ███  ██   ██ ██   ████  ██████       `}
              </pre>
              <pre className="text-[6px] sm:text-[8px] md:text-[10px] leading-[1] font-mono inline-block" aria-hidden="true">
{`██    ██ ██    ██  █████  ███    ██     ██     ██  █████  ███    ██  ██████       
 ██  ██  ██    ██ ██   ██ ████   ██     ██     ██ ██   ██ ████   ██ ██            
  ████   ██    ██ ███████ ██ ██  ██     ██  █  ██ ███████ ██ ██  ██ ██   ███      
   ██    ██    ██ ██   ██ ██  ██ ██     ██ ███ ██ ██   ██ ██  ██ ██ ██    ██      
   ██     ██████  ██   ██ ██   ████      ███ ███  ██   ██ ██   ████  ██████       `}
              </pre>
              <pre className="text-[6px] sm:text-[8px] md:text-[10px] leading-[1] font-mono inline-block" aria-hidden="true">
{`██    ██ ██    ██  █████  ███    ██     ██     ██  █████  ███    ██  ██████       
 ██  ██  ██    ██ ██   ██ ████   ██     ██     ██ ██   ██ ████   ██ ██            
  ████   ██    ██ ███████ ██ ██  ██     ██  █  ██ ███████ ██ ██  ██ ██   ███      
   ██    ██    ██ ██   ██ ██  ██ ██     ██ ███ ██ ██   ██ ██  ██ ██ ██    ██      
   ██     ██████  ██   ██ ██   ████      ███ ███  ██   ██ ██   ████  ██████       `}
              </pre>
            </div>
          </div>
          <p className="text-[rgb(119,123,126)] text-[16px] italic font-bold font-normal">Oaks form little acorns grown.</p>
          
          <div className="flex gap-4 mt-4">
            <a 
              href="#" 
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Twitter"
            >
              <XIcon className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <nav className={`flex flex-wrap gap-2 sm:gap-6 ${isArticleView ? '' : 'mt-8'}`}>
          <button 
            onClick={() => onNavigate('home')} 
            className={`${currentView === 'home' ? 'font-bold' : ''} hover:text-gray-900 transition-colors whitespace-nowrap text-lg sm:text-2xl font-medium`}
            style={{ color: currentView === 'home' ? '#235347' : '#4B5563' }}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('archives')} 
            className={`${currentView === 'archives' ? 'font-bold' : ''} hover:text-gray-900 transition-colors whitespace-nowrap text-lg sm:text-2xl font-medium`}
            style={{ color: currentView === 'archives' ? '#235347' : '#4B5563' }}
          >
            Archives
          </button>
          <button 
            onClick={() => onNavigate('categories')} 
            className={`${currentView === 'categories' ? 'font-bold' : ''} hover:text-gray-900 transition-colors whitespace-nowrap text-lg sm:text-2xl font-medium`}
            style={{ color: currentView === 'categories' ? '#235347' : '#4B5563' }}
          >
            Categories
          </button>
          <button 
            onClick={() => onNavigate('tags')} 
            className={`${currentView === 'tags' ? 'font-bold' : ''} hover:text-gray-900 transition-colors whitespace-nowrap text-lg sm:text-2xl font-medium`}
            style={{ color: currentView === 'tags' ? '#235347' : '#4B5563' }}
          >
            Tags
          </button>
          <button 
            onClick={() => onNavigate('about')} 
            className={`${currentView === 'about' ? 'font-bold' : ''} hover:text-gray-900 transition-colors whitespace-nowrap text-lg sm:text-2xl font-medium`}
            style={{ color: currentView === 'about' ? '#235347' : '#4B5563' }}
          >
            About
          </button>
        </nav>
      </div>
    </header>
  );
}
