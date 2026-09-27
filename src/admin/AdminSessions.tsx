import React, { useState, useEffect } from 'react';
import {
  Camera,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getSessionsList,
  createSession,
  updateSession,
  deleteSession,
} from '../data/availability';
import { SessionDetail } from '../types';

export const AdminSessions: React.FC = () => {
  const [sessions, setSessions] = useState<SessionDetail[]>(getSessionsList());
  const [editingSession, setEditingSession] = useState<SessionDetail | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Sesiones');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formDuration, setFormDuration] = useState('1.5 - 2 horas');
  const [formPriceNote, setFormPriceNote] = useState('Consultar');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formHighlightsText, setFormHighlightsText] = useState('');

  useEffect(() => {
    const handleUpdate = () => setSessions(getSessionsList());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setFormTitle('');
    setFormCategory('Sesiones');
    setFormShortDesc('');
    setFormFullDesc('');
    setFormDuration('2 horas');
    setFormPriceNote('Consultar');
    setFormImageUrl(
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85'
    );
    setFormHighlightsText('Dirección de poses\nGalería digital\nEdición editorial');
    setIsCreating(true);
    setEditingSession(null);
  };

  const handleOpenEdit = (session: SessionDetail) => {
    setEditingSession(session);
    setFormTitle(session.title);
    setFormCategory(session.category);
    setFormShortDesc(session.shortDesc);
    setFormFullDesc(session.fullDesc);
    setFormDuration(session.duration);
    setFormPriceNote(session.priceNote);
    setFormImageUrl(session.imageUrl);
    setFormHighlightsText(session.highlights.join('\n'));
    setIsCreating(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const highlights = formHighlightsText
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    if (isCreating) {
      const created = createSession({
        title: formTitle.trim(),
        category: formCategory.trim(),
        shortDesc: formShortDesc.trim(),
        fullDesc: formFullDesc.trim(),
        duration: formDuration.trim(),
        priceNote: formPriceNote.trim(),
        imageUrl: formImageUrl.trim(),
        highlights,
        active: true,
      });
      showToast(`¡Sesión "${created.title}" creada! Ya es visible en la página pública.`);
      setIsCreating(false);
    } else if (editingSession) {
      updateSession(editingSession.id, {
        title: formTitle.trim(),
        category: formCategory.trim(),
        shortDesc: formShortDesc.trim(),
        fullDesc: formFullDesc.trim(),
        duration: formDuration.trim(),
        priceNote: formPriceNote.trim(),
        imageUrl: formImageUrl.trim(),
        highlights,
      });
      showToast(`Sesión "${formTitle}" actualizada con éxito.`);
      setEditingSession(null);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Estás seguro de eliminar la sesión "${title}"?`)) {
      deleteSession(id);
      showToast(`Sesión "${title}" eliminada.`);
    }
  };

  const handleToggleActive = (session: SessionDetail) => {
    const nextState = session.active === false ? true : false;
    updateSession(session.id, { active: nextState });
    showToast(
      nextState
        ? `Sesión "${session.title}" activada en la web pública.`
        : `Sesión "${session.title}" desactivada temporalmente.`
    );
  };

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
            Gestión de Sesiones
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configura las sesiones que se muestran a los clientes finales en la sección pública "Sesiones".
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Sesión</span>
        </button>
      </div>

      {/* Create / Edit Modal / Drawer */}
      {(isCreating || editingSession) && (
        <div className="bg-zinc-900 border border-zinc-700 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">
              {isCreating ? 'Crear Nueva Propuesta de Sesión' : `Editar: ${editingSession?.title}`}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingSession(null);
              }}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Nombre de la Sesión *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Retratos Fine Art"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Categoría
                </label>
                <input
                  type="text"
                  placeholder="Ej: Retratos, Editorial, Exterior..."
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Duración
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1.5 - 2 horas"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Precio o Nota de Inversión
                </label>
                <input
                  type="text"
                  placeholder="Ej: Consultar / Desde $150"
                  value={formPriceNote}
                  onChange={(e) => setFormPriceNote(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                URL de Fotografía
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Descripción Breve (para resumen)
              </label>
              <input
                type="text"
                placeholder="Frase concisa que describe el concepto de la sesión"
                value={formShortDesc}
                onChange={(e) => setFormShortDesc(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Descripción Completa
              </label>
              <textarea
                rows={3}
                placeholder="Explica qué incluye la sesión, el ambiente y el enfoque visual..."
                value={formFullDesc}
                onChange={(e) => setFormFullDesc(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Características / Puntos Clave (uno por línea)
              </label>
              <textarea
                rows={3}
                placeholder="Dirección de poses&#10;Galería digital privada&#10;Cambios de vestuario"
                value={formHighlightsText}
                onChange={(e) => setFormHighlightsText(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingSession(null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors shadow"
              >
                Guardar Sesión
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((s) => {
          const isActive = s.active !== false;

          return (
            <div
              key={s.id}
              className={`bg-zinc-900 border rounded-xl overflow-hidden shadow transition-all flex flex-col justify-between ${
                isActive ? 'border-zinc-800' : 'border-zinc-800 opacity-60'
              }`}
            >
              <div>
                {/* Photo Preview Banner */}
                <div className="h-44 relative overflow-hidden bg-black">
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    className="w-full h-full object-cover filter grayscale contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                  {/* Active / Inactive Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {isActive ? 'Activa en la Web' : 'Desactivada'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/80 px-2 py-1 rounded text-xs text-white">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span className="text-[11px] font-mono">{s.duration}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        {s.category}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-0.5">{s.title}</h3>
                    </div>

                    <span className="text-xs text-zinc-300 font-medium px-2 py-1 bg-zinc-800 rounded">
                      {s.priceNote}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {s.fullDesc}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                    {s.highlights.map((h, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-zinc-300">
                        <Check className="w-3 h-3 text-white shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(s)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1.5"
                >
                  {isActive ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Desactivar</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Activar</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs flex items-center space-x-1"
                    title="Editar sesión"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.title)}
                    className="p-2 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg text-xs"
                    title="Eliminar sesión"
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
