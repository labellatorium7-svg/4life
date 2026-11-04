import React, { useState, useEffect } from 'react';
import { ContentProject, SourceRecord } from './types';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { NewProjectModal } from './components/NewProjectModal';
import { DashboardView } from './views/DashboardView';
import { KepalaPabrikView } from './views/KepalaPabrikView';
import { StrategyView } from './views/StrategyView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { ScriptStudioView } from './views/ScriptStudioView';
import { ComplianceView } from './views/ComplianceView';
import { SceneDesignerView } from './views/SceneDesignerView';
import { FlowPromptsView } from './views/FlowPromptsView';
import { VoiceoverView } from './views/VoiceoverView';
import { ProductionPackageView } from './views/ProductionPackageView';
import { ContentLibraryView } from './views/ContentLibraryView';
import { SettingsView } from './views/SettingsView';
import { ProductionMonitorView } from './views/ProductionMonitorView';
import { VideoStudioView } from './views/VideoStudioView';
import { ExecutiveApprovalView } from './views/ExecutiveApprovalView';

export default function App() {
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [activeProject, setActiveProject] = useState<ContentProject | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from server
  useEffect(() => {
    async function initData() {
      try {
        const [projRes, kbRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/knowledge-base'),
        ]);

        if (projRes.ok) {
          const projs: ContentProject[] = await projRes.json();
          setProjects(projs);
          if (projs.length > 0) {
            setActiveProject(projs[0]);
          }
        }

        if (kbRes.ok) {
          const kb: SourceRecord[] = await kbRes.json();
          setSources(kb);
        }
      } catch (err) {
        console.error('Failed to load initial data from server:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  const handleSelectProject = (projectId: string) => {
    const found = projects.find((p) => p.id === projectId);
    if (found) {
      setActiveProject(found);
    }
  };

  const handleUpdateProject = async (updated: ContentProject) => {
    // Optimistic UI update
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (activeProject?.id === updated.id) {
      setActiveProject(updated);
    }

    try {
      await fetch(`/api/projects/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to update project on server:', err);
    }
  };

  const handleProjectCreatedOrUpdated = (project: ContentProject) => {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === project.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = project;
        return copy;
      }
      return [project, ...prev];
    });
    setActiveProject(project);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Apakah Bos Besar yakin ingin menghapus proyek ini?')) return;

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProject?.id === projectId) {
      const remaining = projects.filter((p) => p.id !== projectId);
      setActiveProject(remaining.length > 0 ? remaining[0] : null);
    }

    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete project on server:', err);
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const duplicate: ContentProject = await res.json();
        setProjects((prev) => [duplicate, ...prev]);
        setActiveProject(duplicate);
      }
    } catch (err) {
      console.error('Failed to duplicate project on server:', err);
    }
  };

  const handleAddSource = async (newSourceData: Partial<SourceRecord>) => {
    try {
      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSourceData),
      });
      if (res.ok) {
        const created: SourceRecord = await res.json();
        setSources((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add source to server:', err);
    }
  };

  const handleBatchAddSources = (newSources: SourceRecord[]) => {
    setSources((prev) => {
      const merged = [...newSources];
      for (const p of prev) {
        if (!merged.some((m) => m.sourceId === p.sourceId)) {
          merged.push(p);
        }
      }
      return merged;
    });
  };

  const handleDeleteSource = async (sourceId: string) => {
    setSources((prev) => prev.filter((s) => s.sourceId !== sourceId));
    try {
      await fetch(`/api/knowledge-base/${sourceId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete source on server:', err);
    }
  };

  const handleApproveProject = (projectId: string) => {
    if (!activeProject || activeProject.id !== projectId) return;

    const updated: ContentProject = {
      ...activeProject,
      status: 'approved',
      approval: {
        isApproved: true,
        approvedBy: 'Founder & Chairman (Bos Besar)',
        approvedAt: new Date().toISOString(),
        feedback: 'Konten telah disetujui penuh oleh Founder & Chairman untuk proses rendering video.',
      },
    };
    handleUpdateProject(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Bar following 3-Zone Contract */}
      <TopBar
        activeProject={activeProject}
        onNavigate={setCurrentView}
        onNewProject={() => setIsModalOpen(true)}
        onApproveProject={handleApproveProject}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with 12 Sections */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          projects={projects}
          activeProject={activeProject}
          onSelectProject={handleSelectProject}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950/95">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Memuat Sistem Produksi Pabrik...
            </div>
          ) : (
            <>
              {currentView === 'executive_approval' && (
                <ExecutiveApprovalView
                  activeProject={activeProject}
                  onUpdateProject={handleUpdateProject}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'dashboard' && (
                <DashboardView
                  projects={projects}
                  activeProject={activeProject}
                  sources={sources}
                  onNavigate={setCurrentView}
                  onSelectProject={handleSelectProject}
                  onProjectCreatedOrUpdated={handleProjectCreatedOrUpdated}
                />
              )}

              {currentView === 'monitor' && (
                <ProductionMonitorView
                  projects={projects}
                  activeProject={activeProject}
                  sources={sources}
                  onNavigate={setCurrentView}
                  onSelectProject={handleSelectProject}
                  onApproveProject={handleApproveProject}
                  onProjectCreatedOrUpdated={handleProjectCreatedOrUpdated}
                />
              )}

              {currentView === 'video_studio' && (
                <VideoStudioView
                  activeProject={activeProject}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'kepala_pabrik' && (
                <KepalaPabrikView
                  activeProject={activeProject}
                  onProjectCreatedOrUpdated={handleProjectCreatedOrUpdated}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'strategy' && (
                <StrategyView
                  activeProject={activeProject}
                  onUpdateProject={handleUpdateProject}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'knowledge_base' && (
                <KnowledgeBaseView
                  sources={sources}
                  activeProject={activeProject}
                  onAddSource={handleAddSource}
                  onBatchAddSources={handleBatchAddSources}
                  onDeleteSource={handleDeleteSource}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'script_studio' && (
                <ScriptStudioView
                  activeProject={activeProject}
                  onUpdateProject={handleUpdateProject}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'compliance' && (
                <ComplianceView
                  activeProject={activeProject}
                  onUpdateProject={handleUpdateProject}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'scene_designer' && (
                <SceneDesignerView
                  activeProject={activeProject}
                  onUpdateProject={handleUpdateProject}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'flow_prompts' && (
                <FlowPromptsView
                  activeProject={activeProject}
                  onUpdateProject={handleUpdateProject}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'voiceover_studio' && (
                <VoiceoverView
                  activeProject={activeProject}
                  onUpdateProject={handleUpdateProject}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'production_package' && (
                <ProductionPackageView
                  activeProject={activeProject}
                  onUpdateProject={handleUpdateProject}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'content_library' && (
                <ContentLibraryView
                  projects={projects}
                  activeProject={activeProject}
                  onSelectProject={handleSelectProject}
                  onDuplicateProject={handleDuplicateProject}
                  onDeleteProject={handleDeleteProject}
                  onNewProject={() => setIsModalOpen(true)}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* New Project Wizard Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={(newProj) => {
          handleProjectCreatedOrUpdated(newProj);
          setCurrentView('script_studio');
        }}
      />
    </div>
  );
}
