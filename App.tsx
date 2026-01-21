
import React, { useState, useEffect } from 'react';
import { Controls } from './components/Controls';
import { Metrics } from './components/Metrics';
import { Legend } from './components/Legend';
import { PhaseScope } from './components/PhaseScope';
import { KernelEditor } from './components/KernelEditor';
import { CruciformLattice } from './components/CruciformLattice';
import { FrameworkSpecs } from './components/FrameworkSpecs';
import { TensorVis } from './components/TensorVis';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Footer } from './components/Footer';
import { GeminiChatModal } from './components/GeminiChatModal';
import { useSimulation } from './hooks/useSimulation';
import { useAudio } from './hooks/useAudio';
import { InterfaceSelector } from './components/InterfaceSelector';
import type { GlobalSettings, SimulationMode, GateWeightMap } from './types';
import { QubeItLattice } from './components/QubeItLattice';
import { Tutorial } from './components/Tutorial';
import { GlobalSettingsPanel } from './components/GlobalSettingsPanel';
import { GeminiGeneratorModal } from './components/GeminiGeneratorModal';
import { LogicWeightController } from './components/LogicWeightController';

const App: React.FC = () => {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    recurrenceDepth: 1, 
    particleDensity: 0.05, 
    glowIntensity: 1.0,
    loopGain: 0.85,
    phaseShift: 0.0,
    showNeuralLinks: false
  });

  const [simulationMode, setSimulationMode] = useState<SimulationMode>('CONSUMER_LEVEL');
  const [hoveredWeightKey, setHoveredWeightKey] = useState<keyof GateWeightMap | null>(null);

  const {
    lattice, coreGrid, kernelFace, running, metrics, delay, buses,
    patterns, showBorders, metricsHistory, interconnects, gateConfigs,
    handleStep, handleReset, handleCellClick, handleLoadPattern,
    handleCoreGridChange, handleResetCoreGrid, setRunning, setDelay,
    handleClear, setCoreGrid, handleApplyGeneratedPattern, handleInterconnectToggle,
    onToggleBorders, handleUpdateGateConfig
  } = useSimulation({ globalSettings, activeMode: simulationMode });

  const {
    volume, waveform, audioSource, audioProfile, playFeedbackSound,
    handleVolumeChange, handleWaveformChange, initAudio, 
    handleAudioSourceChange, handleAudioProfileChange
  } = useAudio();

  useEffect(() => {
    if(running && metrics) playFeedbackSound(metrics as any);
  }, [running, metrics, playFeedbackSound]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const renderVisualization = () => {
    switch (simulationMode) {
        case 'CONSUMER_LEVEL':
            return (
                <div className="relative w-full flex items-center justify-center fade-in-component">
                    <CruciformLattice 
                        lattice={lattice} buses={buses}
                        kernelFace={kernelFace} onCellClick={handleCellClick} showBorders={showBorders} 
                        mode={simulationMode}
                        hoveredWeightKey={hoveredWeightKey}
                        gateConfigs={gateConfigs}
                    />
                </div>
            );
        case 'PHYSXZARD_CORE':
            return (
                <div className="w-full flex flex-col items-center justify-center gap-4 fade-in-component h-full overflow-y-auto py-8">
                    <CruciformLattice 
                        lattice={lattice} buses={buses}
                        kernelFace={kernelFace} onCellClick={handleCellClick} showBorders={showBorders} 
                        mode={simulationMode}
                        hoveredWeightKey={hoveredWeightKey}
                        gateConfigs={gateConfigs}
                    />
                    <AnalysisPanel coreGrid={coreGrid} kernelFace={kernelFace} />
                    <TensorVis />
                    <FrameworkSpecs />
                </div>
            );
        case 'CINEMATIC_STACK':
            return (
                <div className="w-full flex items-center justify-center fade-in-component h-full">
                    <QubeItLattice lattice={lattice} kernelFace={kernelFace} glowIntensity={globalSettings.glowIntensity} />
                </div>
            );
        default: return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-2 sm:p-4 bg-slate-950">
      <header className="relative text-center mb-2 w-full fade-in-component py-2">
        <h1 className="text-3xl md:text-5xl font-orbitron font-bold text-cyan-300 tracking-wider holographic-title uppercase">CYCLARIO</h1>
        <p className="text-cyan-500/80 mt-1 text-xs md:text-sm tracking-widest uppercase font-mono">Recurrent Automaton Engine v5.0</p>
      </header>
      
      <main className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] items-start gap-4">
        <aside className="w-full flex-shrink-0 order-2 lg:order-1 flex flex-col gap-4 fade-in-component">
          <PhaseScope metricsHistory={metricsHistory} />
          <GlobalSettingsPanel 
            settings={globalSettings} 
            onSettingsChange={(s, v) => setGlobalSettings(p => ({ ...p, [s]: v }))} 
            isDisabled={running} 
            mode={simulationMode}
          />
          <KernelEditor coreGrid={coreGrid} onGridChange={handleCoreGridChange} onReset={handleResetCoreGrid} isDisabled={running} onLoadPreset={setCoreGrid} />
          <LogicWeightController 
            configs={gateConfigs} 
            onUpdateConfig={handleUpdateGateConfig} 
            isDisabled={running}
            onHoverWeight={setHoveredWeightKey}
          />
          <Legend />
        </aside>

        <section className="flex-grow flex flex-col items-center order-1 lg:order-2 w-full">
            <InterfaceSelector currentMode={simulationMode} onModeChange={setSimulationMode} />
            <div className="relative w-full min-h-[600px] flex items-center justify-center scanlines rounded-xl overflow-hidden shadow-2xl bg-slate-900/20 border border-slate-800/50 backdrop-blur-sm">
                {renderVisualization()}
            </div>
            <div className="w-full mt-4 flex flex-col items-center gap-4">
                <Metrics metrics={metrics} history={metricsHistory} mode={simulationMode} />
                <Controls
                    onStart={() => { initAudio(); setRunning(true); }} 
                    onStop={() => setRunning(false)} 
                    onStep={handleStep} 
                    onReset={handleReset} 
                    onClear={handleClear}
                    onLoadPattern={handleLoadPattern} 
                    isRunning={running} 
                    delay={delay} 
                    effectiveDelay={delay} 
                    onDelayChange={(e) => setDelay(parseInt(e.target.value, 10))}
                    onSetDelay={setDelay} 
                    patterns={patterns} 
                    selectedPatternId={''} 
                    onSavePattern={() => {}} 
                    onUpdatePattern={() => {}} 
                    onDeletePattern={() => {}}
                    volume={volume} 
                    onVolumeChange={handleVolumeChange} 
                    waveform={waveform} 
                    onWaveformChange={handleWaveformChange}
                    audioSource={audioSource as any} 
                    onAudioSourceChange={(e) => handleAudioSourceChange(e as any)}
                    audioProfile={audioProfile} 
                    onAudioProfileChange={handleAudioProfileChange} 
                    showBorders={showBorders} 
                    onToggleBorders={onToggleBorders}
                    onOpenGenerator={() => setIsGeneratorOpen(true)}
                    interconnects={interconnects}
                    onInterconnectToggle={handleInterconnectToggle}
                />
            </div>
        </section>
      </main>

      <Footer onMenuClick={() => setIsModalOpen(true)} onHelpClick={() => setIsTutorialOpen(true)} />
      <GeminiChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Tutorial isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <GeminiGeneratorModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} onApply={handleApplyGeneratedPattern} />
    </div>
  );
};
export default App;
