import React, { useState, useMemo, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { FileSystemNode, FolderNode, FileNode } from '../types';
import Modal from './Modal';

interface FileManagerProps {
  mode: 'teacher' | 'student';
}

const FileManager: React.FC<FileManagerProps> = ({ mode }) => {
  const [items, setItems] = useLocalStorage<FileSystemNode[]>('file-system', []);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // States for folder creation modal and notifications
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderNameError, setFolderNameError] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    window.setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const breadcrumbs = useMemo(() => {
    const path: (FolderNode | { id: null; name: string })[] = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = items.find(i => i.id === currentId) as FolderNode;
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break; // Should not happen in a consistent state
      }
    }
    path.unshift({ id: null, name: 'Root' });
    return path;
  }, [currentFolderId, items]);

  const currentItems = useMemo(() => {
    const itemsInFolder = items.filter(item => item.parentId === currentFolderId);
    
    const filteredItems = searchQuery
      ? itemsInFolder.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : itemsInFolder;

    return filteredItems.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });
  }, [items, currentFolderId, searchQuery]);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newFile: FileNode = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: 'file',
        parentId: currentFolderId,
        dataUrl: e.target?.result as string,
        fileType: file.type,
      };
      setItems([...items, newFile]);
      showNotification(`File '${file.name}' uploaded successfully.`);
    };
    reader.readAsDataURL(file);
    if(fileInputRef.current) fileInputRef.current.value = ""; // Reset input
  };

  const handleCreateFolder = () => {
    setNewFolderName('');
    setFolderNameError('');
    setIsCreatingFolder(true);
  };

  const handleConfirmCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newFolderName.trim();

    if (!trimmedName) {
      setFolderNameError('Folder name cannot be empty.');
      return;
    }

    const isDuplicate = items.some(
      item =>
        item.parentId === currentFolderId &&
        item.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setFolderNameError(`An item named "${trimmedName}" already exists in this folder.`);
      return;
    }
    
    const newFolder: FolderNode = {
      id: `folder-${Date.now()}`,
      name: trimmedName,
      type: 'folder',
      parentId: currentFolderId,
    };
    setItems([...items, newFolder]);
    
    setIsCreatingFolder(false);
    showNotification(`Folder '${trimmedName}' created successfully.`);
  };

  const handleDelete = (item: FileSystemNode) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"? This cannot be undone.`)) {
      return;
    }
    let idsToDelete = new Set<string>([item.id]);
    if (item.type === 'folder') {
      const findChildrenRecursive = (folderId: string) => {
        const children = items.filter(i => i.parentId === folderId);
        children.forEach(child => {
          idsToDelete.add(child.id);
          if (child.type === 'folder') {
            findChildrenRecursive(child.id);
          }
        });
      };
      findChildrenRecursive(item.id);
    }
    setItems(items.filter(i => !idsToDelete.has(i.id)));
    showNotification(`"${item.name}" was deleted.`);
  };
  
  const handleDownload = (file: FileNode) => {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }
  
  const FolderIcon = () => <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>;
  const FileIcon = () => <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm.293 3.293a1 1 0 011.414 0L10 10.586l4.293-4.293a1 1 0 111.414 1.414L11.414 12l4.293 4.293a1 1 0 01-1.414 1.414L10 13.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 12 4.293 7.707a1 1 0 010-1.414z"></path></svg>;
  const PDFIcon = () => <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>;

  const getFileIcon = (fileType: string) => {
      if (fileType === 'application/pdf') return <PDFIcon />;
      return <FileIcon />;
  }

  return (
    <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      {notification && (
        <div 
          className={`fixed top-20 right-8 p-4 rounded-lg shadow-lg text-white z-50 transition-transform transform animate-fade-in-down ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} 
          role="alert"
        >
          {notification.message}
        </div>
      )}
      
      {isCreatingFolder && (
        <Modal title="Create New Folder" onClose={() => setIsCreatingFolder(false)}>
          <form onSubmit={handleConfirmCreateFolder} className="p-2 space-y-4">
            <div>
              <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-2">Folder Name</label>
              <input
                type="text"
                id="folderName"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  if (folderNameError) setFolderNameError('');
                }}
                className={`w-full px-4 py-2 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${folderNameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-indigo-500'}`}
                placeholder="e.g., Lecture Notes"
                autoFocus
                aria-invalid={!!folderNameError}
                aria-describedby="folder-name-error"
              />
              {folderNameError && <p id="folder-name-error" className="text-sm text-red-400 mt-2">{folderNameError}</p>}
            </div>
            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-indigo-400">
            {mode === 'teacher' ? 'File Manager' : 'Study Materials'}
        </h2>
        {mode === 'teacher' && (
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              ➕ Upload File
            </button>
            <button onClick={handleCreateFolder} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
              📁 New Folder
            </button>
          </div>
        )}
      </div>
      
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id || 'root'}>
                <button 
                    onClick={() => {
                        setCurrentFolderId(crumb.id);
                        setSearchQuery(''); // Reset search when changing folders
                    }} 
                    className="hover:text-white hover:underline"
                >
                    {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
        ))}
      </nav>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search files and folders in this directory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search files and folders"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-600">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3 hidden sm:table-cell">Type</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? currentItems.map(item => (
              <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-3">
                  <button 
                    className={`flex items-center gap-3 text-white ${item.type === 'folder' ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => {
                      if (item.type === 'folder') {
                        setCurrentFolderId(item.id);
                        setSearchQuery(''); // Reset search when opening a folder
                      }
                    }}
                    disabled={item.type === 'file'}
                  >
                    {item.type === 'folder' ? <FolderIcon /> : getFileIcon((item as FileNode).fileType)}
                    <span>{item.name}</span>
                  </button>
                </td>
                <td className="p-3 text-gray-400 capitalize hidden sm:table-cell">{item.type}</td>
                <td className="p-3">
                  {mode === 'teacher' && (
                    <button onClick={() => handleDelete(item)} className="p-1 text-red-400 hover:text-red-300" aria-label={`Delete ${item.name}`}>
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    </button>
                  )}
                  {mode === 'student' && item.type === 'file' && (
                     <button onClick={() => handleDownload(item as FileNode)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Download
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="text-center p-8 text-gray-400">
                    {searchQuery ? `No files or folders match "${searchQuery}".` : 'This folder is empty.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileManager;
