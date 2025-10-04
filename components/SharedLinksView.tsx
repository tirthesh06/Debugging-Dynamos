import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { SharedLink } from '../types';
import AnimatedElement from './AnimatedElement';

const SharedLinksView: React.FC = () => {
  const [links] = useLocalStorage<SharedLink[]>('shared-links', []);
  
  // Sort links alphabetically by title for a consistent view
  const sortedLinks = React.useMemo(() => {
    return [...links].sort((a, b) => a.title.localeCompare(b.title));
  }, [links]);

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-indigo-400">Important Links</h2>
      {sortedLinks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedLinks.map((link, index) => (
            <AnimatedElement key={link.id} delay={index * 100}>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-indigo-500 group interactive-card"
              >
                <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                   <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                   {link.title}
                </h3>
                {link.description && <p className="text-gray-400 mt-1 text-sm">{link.description}</p>}
                <p className="text-xs text-indigo-400 mt-2 break-all opacity-70 group-hover:opacity-100 transition-opacity">
                  {link.url}
                </p>
              </a>
            </AnimatedElement>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            <h3 className="text-xl font-semibold">No Links Available</h3>
            <p className="mt-1">Your teacher has not shared any important links yet.</p>
        </div>
      )}
    </div>
  );
};

export default SharedLinksView;