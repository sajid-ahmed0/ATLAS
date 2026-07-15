import React, { useEffect, useState } from 'react';
import { 
  Library, 
  Search, 
  Plus, 
  Trash2, 
  Bookmark, 
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Edit2,
  Tag
} from 'lucide-react';
import { useAuth } from './AuthContext.tsx';
import { KnowledgeItem } from '../types.ts';

interface KnowledgeViewProps {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'loading') => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({ showToast }) => {
  const { token } = useAuth();
  
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<string>('frameworks');
  const [tags, setTags] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!token) return;
    fetchKnowledgeItems();
  }, [token]);

  const fetchKnowledgeItems = async () => {
    try {
      const response = await fetch('/api/knowledge', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        if (data.length > 0 && !selectedItem) {
          setSelectedItem(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    showToast('Storing wisdom inside knowledge engine...', 'loading');
    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          category,
          tags,
          source
        })
      });

      if (response.ok) {
        const created = await response.json();
        setItems([created, ...items]);
        setSelectedItem(created);
        
        // Reset
        setTitle('');
        setContent('');
        setTags('');
        setSource('');
        setIsCreating(false);
        showToast('Knowledge item registered.', 'success');
      } else {
        showToast('Failed to register knowledge.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error creating knowledge item.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this knowledge card?')) return;
    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setItems(items.filter(i => i.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(items.find(i => i.id !== id) || null);
        }
        showToast('Wisdom card removed.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Categories
  const categoriesList = ['All', 'notes', 'career', 'books', 'articles', 'ideas', 'projects', 'lessons', 'memories', 'quotes', 'frameworks'];

  // Filters
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[#fafafa] font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">Knowledge Base</h2>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Build your high-integrity external brain. Record models, books, frameworks, and strategic paradigms.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white text-black hover:bg-[#fafafa]/90 rounded-lg transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Record Wisdom Card
        </button>
      </div>

      {/* Search and Categories bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#18181b] p-4 border border-[#27272a] rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search keywords, titles, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-[#27272a] rounded-xl text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1 pr-2 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-[11px] font-bold font-mono uppercase rounded-lg border shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-white/[0.04] border-white/30 text-white' 
                  : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 1 Column: List cards */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest">Wisdom Index ({filteredItems.length})</h3>
          
          {filteredItems.length === 0 ? (
            <p className="text-xs text-[#71717a] italic">No corresponding knowledge entries found.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsCreating(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedItem?.id === item.id 
                      ? 'bg-[#18181b] border-white text-[#fafafa] font-medium'
                      : 'bg-[#09090b]/50 border-[#27272a]/80 text-[#a1a1aa] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h4 className="text-sm font-semibold truncate flex-1 leading-tight">{item.title}</h4>
                    <span className="text-[9px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717a] truncate mb-2">{item.content}</p>
                  
                  {item.tags && (
                    <div className="flex items-center gap-1 flex-wrap mt-2">
                      <Tag className="w-3 h-3 text-[#71717a]" />
                      {item.tags.split(',').map((tag, i) => (
                        <span key={i} className="text-[9px] text-[#a1a1aa] bg-[#18181b] px-1.5 py-0.5 rounded border border-[#27272a]">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Create Form or Detailed Reading Frame */}
        <div className="lg:col-span-2">
          
          {isCreating ? (
            
            // CREATION FORM
            <form onSubmit={handleCreateItem} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-2 border-b border-[#27272a] pb-3 mb-2">
                <Bookmark className="w-5 h-5 text-white" />
                <h3 className="text-md font-bold font-display text-white">Record New Knowledge Entry</h3>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Wisdom / Note Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunk Cost Fallacy: Decision Traps"
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                  >
                    {categoriesList.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. cognitive bias, strategy, bias"
                    className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Source Link / Attribution</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Book: Thinking, Fast and Slow"
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-2 font-bold">Comprehensive Body Content</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the notes, summaries, lessons, or concepts down clearly..."
                  rows={8}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46] font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-[#27272a] border border-[#3f3f46] hover:bg-[#27272a]/80 text-[#fafafa] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-[#fafafa]/90 transition-colors cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Record to Brain'}
                </button>
              </div>
            </form>
          ) : (
            
            // DETAILED READING FRAME
            selectedItem ? (
              <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.01] blur-3xl rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-start gap-4 flex-wrap pb-4 border-b border-[#27272a]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[#09090b] border border-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded font-mono font-bold uppercase">
                        {selectedItem.category}
                      </span>
                      {selectedItem.source && (
                        <span className="text-xs text-[#a1a1aa] font-medium italic flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Source: {selectedItem.source}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold font-display text-white">{selectedItem.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="p-2 text-[#71717a] hover:text-rose-400 hover:bg-[#09090b] rounded-lg border border-transparent hover:border-[#27272a] transition-all cursor-pointer"
                    title="Remove Knowledge Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content Box */}
                <div className="text-sm text-[#a1a1aa] leading-relaxed font-mono whitespace-pre-wrap bg-[#09090b] p-5 border border-[#27272a]/60 rounded-xl max-h-[50vh] overflow-y-auto">
                  {selectedItem.content}
                </div>

                {/* Footer tags */}
                {selectedItem.tags && (
                  <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-[#27272a]/60">
                    <Tag className="w-3.5 h-3.5 text-[#71717a]" />
                    {selectedItem.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="text-xs text-[#a1a1aa] bg-[#09090b] border border-[#27272a] px-2.5 py-1 rounded-lg">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            ) : (
              <div className="py-16 text-center text-[#71717a] border border-dashed border-[#27272a] rounded-2xl bg-[#09090b]/20">
                <Library className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a knowledge card from the index, or record a new wisdom card above.</p>
              </div>
            )

          )}

        </div>

      </div>

    </div>
  );
};
