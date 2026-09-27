import React, { useState, useEffect } from 'react';
import {
  Image,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  X,
  ExternalLink,
  Database,
} from 'lucide-react';
import {
  getPortfolioList,
  savePortfolioList,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '../data/availability';
import { PortfolioItem, PortfolioCategory } from '../types';

export const AdminPortfolio: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>(getPortfolioList());
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'todos' | PortfolioCategory>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PortfolioCategory>('retratos');
  const [imageUrl, setImageUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'tall' | 'wide' | 'square'>('tall');
  const [quote, setQuote] = useState('');
  const [location, setLocation] = useState('República Dominicana');

  useEffect(() => {
    const handleUpdate = () => setItems(getPortfolioList());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setTitle('');
    setCategory('retratos');
    setImageUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85');
    setAspectRatio('tall');
    setQuote('Luz y contraste que revelan la verdad del instante.');
    setLocation('Estudio · RD');
    setIsCreating(true);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const categoryLabels: Record<PortfolioCategory, string> = {
      todos: 'Todo',
      retratos: 'Retratos',
      sesiones: 'Sesiones',
      exterior: 'Exterior',
      editorial: 'Editorial',
    };

    const created = createPortfolioItem({
      title: title.trim(),
      category,
      categoryLabel: categoryLabels[category],
      imageUrl: imageUrl.trim(),
      aspectRatio,
      quote: quote.trim(),
      location: location.trim(),
      active: true,
    });

    showToast(`Fotografía "${created.title}" agregada al portafolio público.`);
    setIsCreating(false);
  };

  const handleDelete = (id: string, photoTitle: string) => {
    if (confirm(`¿Estás seguro de eliminar la foto "${photoTitle}" del portafolio?`)) {
      deletePortfolioItem(id);
      showToast(`Fotografía "${photoTitle}" eliminada.`);
    }
  };

  const handleToggleActive = (item: PortfolioItem) => {
    const nextState = item.active === false ? true : false;
    updatePortfolioItem(item.id, { active: nextState });
    showToast(nextState ? `Foto visible en la web pública.` : `Foto oculta temporalmente.`);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    savePortfolioList(copy);
    showToast('Orden del portafolio actualizado.');
  };

  const handleQuickChangeCategory = (id: string, newCat: PortfolioCategory) => {
    const categoryLabels: Record<PortfolioCategory, string> = {
      todos: 'Todo',
      retratos: 'Retratos',
      sesiones: 'Sesiones',
      exterior: 'Exterior',
      editorial: 'Editorial',
    };
    updatePortfolioItem(id, { category: newCat, categoryLabel: categoryLabels[newCat] });
    showToast(`Categoría cambiada a ${categoryLabels[newCat]}`);
  };

  const filteredItems =
    selectedCategoryFilter === 'todos'
      ? items
      : items.filter((i) => i.category === selectedCategoryFilter);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 border border-emerald-500/50 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3 text-xs animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Gestión del Portafolio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Administra las imágenes, categorías y orden que visualizan los clientes en la sección "Portafolio".
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Fotografía</span>
        </button>
      </div>

      {/* Supabase Storage Ready Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Preparado para Supabase Storage:</strong> Cuando conectemos el backend, la subida de archivos PNG/JPG se enlazará a un bucket privado/público sin cambiar esta vista.
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 hidden md:inline">Storage Adapter Ready</span>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="bg-zinc-900 border border-zinc-700 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">Agregar Fotografía al Portafolio</h2>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSavePhoto} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Título de la Foto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Contraste & Sombra"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Categoría *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PortfolioCategory)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                >
                  <option value="retratos">Retratos</option>
                  <option value="sesiones">Sesiones</option>
                  <option value="exterior">Exterior</option>
                  <option value="editorial">Editorial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  URL de Imagen (Demo o Externa) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Orientación / Formato
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                >
                  <option value="tall">Vertical (3:4)</option>
                  <option value="wide">Horizontal (16:10)</option>
                  <option value="square">Cuadrado (1:1)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Frase o Cita Corta (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: La fuerza del silencio en blanco y negro."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Locación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Estudio · RD"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors shadow"
              >
                Guardar en Portafolio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow">
        <div className="flex flex-wrap items-center gap-2">
          {(['todos', 'retratos', 'sesiones', 'exterior', 'editorial'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors ${
                selectedCategoryFilter === cat
                  ? 'bg-white text-black font-semibold shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-400">
          Mostrando <strong>{filteredItems.length}</strong> fotografías
        </span>
      </div>

      {/* Portfolio Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => {
          const isActive = item.active !== false;

          return (
            <div
              key={item.id}
              className={`bg-zinc-900 border rounded-xl overflow-hidden shadow flex flex-col justify-between transition-all ${
                isActive ? 'border-zinc-800' : 'border-zinc-800 opacity-50'
              }`}
            >
              <div>
                {/* Image */}
                <div className="aspect-[3/4] relative overflow-hidden bg-black">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover filter grayscale contrast-115"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-black/80 text-zinc-300 border border-white/10">
                      {item.categoryLabel}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 inset-x-2.5 text-left">
                    <h3 className="text-sm font-bold text-white leading-tight truncate">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-zinc-400 truncate">{item.location}</p>
                  </div>
                </div>

                {/* Inline Category Switch */}
                <div className="p-3 bg-zinc-950/80 border-t border-zinc-800/80">
                  <label className="text-[10px] text-zinc-400 block mb-1 font-semibold uppercase">
                    Categoría
                  </label>
                  <select
                    value={item.category}
                    onChange={(e) =>
                      handleQuickChangeCategory(item.id, e.target.value as PortfolioCategory)
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 px-2 py-1 text-xs text-white rounded focus:outline-none"
                  >
                    <option value="retratos">Retratos</option>
                    <option value="sesiones">Sesiones</option>
                    <option value="exterior">Exterior</option>
                    <option value="editorial">Editorial</option>
                  </select>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover arriba"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover abajo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className="p-1.5 text-zinc-400 hover:text-white"
                    title={isActive ? 'Ocultar de la web' : 'Hacer visible'}
                  >
                    {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 text-zinc-400 hover:text-red-400"
                    title="Eliminar del portafolio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
