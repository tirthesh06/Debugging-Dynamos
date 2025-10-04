import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { SharedLink, User } from '../types';
import Modal from './Modal';

interface LinkManagerProps {
  user: User;
}

const LinkManager: React.FC<LinkManagerProps> = ({ user }) => {
  const [links, setLinks] = useLocalStorage<SharedLink[]>('shared-links', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<SharedLink | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', description: '' });
  const [formError, setFormError] = useState('');

  const handleAddLink = () => {
    setCurrentLink(null);
    setFormData({ title: '', url: '', description: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleEditLink = (link: SharedLink) => {
    setCurrentLink(link);
    setFormData({ title: link.title, url: link.url, description: link.description || '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteLink = (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      setLinks(links.filter(l => l.id !== linkId));
    }
  };
  
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return urlString.startsWith('http://') || urlString.startsWith('https://');
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      setFormError('Title and URL are required.');
      return;
    }
    
    if (!isValidUrl(formData.url)) {
      setFormError('Please enter a valid URL (e.g., https://example.com).');
      return;
    }

    if (currentLink) { // Editing
      setLinks(links.map(l => l.id === currentLink.id ? { ...l, title: formData.title.trim(), url: formData.url.trim(), description: formData.description.trim() } : l));
    } else { // Adding new
      const newLink: SharedLink = {
        id: `link-${Date.now()}`,
        createdBy: user.id,
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim()
      };
      setLinks([...links, newLink]);
    }
    setIsModalOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const sortedLinks = useMemo(() => {
    return [...links].sort((a, b) => a.title.localeCompare(b.title));
  }, [links]);

  return (
    <>
      {isModalOpen && (
        <Modal title={currentLink ? 'Edit Link' : 'Add New Link'} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="p-2 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Link Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                placeholder="Chapter 5 - Video Lecture"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">Link URL</label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                placeholder="https://www.youtube.com/watch?v=example"
                required
              />
            </div>
             <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                placeholder="This video explains core concepts..."
              />
            </div>
            {formError && <p className="text-sm text-red-400">{formError}</p>}
            <div className="flex justify-end gap-4 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Save Link</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-indigo-400">Manage Shared Links</h2>
          <button onClick={handleAddLink} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            + Add New Link
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-600">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3 hidden sm:table-cell">URL</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLinks.length > 0 ? sortedLinks.map(link => (
                <tr key={link.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{link.title}</span>
                      {link.description && <span className="text-sm text-gray-400 hidden sm:block">{link.description}</span>}
                    </div>
                  </td>
                  <td className="p-3 text-indigo-400 hidden sm:table-cell">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-xs block">{link.url}</a>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditLink(link)} className="p-1 text-blue-400 hover:text-blue-300" aria-label={`Edit ${link.title}`}>
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                      </button>
                       <button onClick={() => handleDeleteLink(link.id)} className="p-1 text-red-400 hover:text-red-300" aria-label={`Delete ${link.title}`}>
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-400">
                    No links have been added yet. Click "+ Add New Link" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default LinkManager;