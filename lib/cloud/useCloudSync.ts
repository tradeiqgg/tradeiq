// =====================================================================
// CHAPTER 10: Cloud Sync Hook for IDE Integration
// =====================================================================

import { useEffect, useRef } from 'react';
import { useIDEEngine } from '@/components/ide/core/IDEEngine';
import { startAutosave, stopAutosave, uploadStrategy } from './strategySync';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to integrate cloud sync with IDE engine
 * Handles autosave every 3 seconds when strategy is valid
 */
export function useCloudSync(strategyId: string | null) {
  const { user } = useAuthStore();
  const {
    tqlText,
    jsonText,
    blockTree,
    compiledJSON,
    compileResult,
    isDirty,
    setIsDirty,
    setIsSaving,
    setLastSaved,
  } = useIDEEngine();

  const lastSavedRef = useRef<string>('');

  // FIXED: Prevent autosave from re-registering constantly
  // Store setters in refs to avoid re-triggering effect
  const setIsDirtyRef = useRef(setIsDirty);
  const setIsSavingRef = useRef(setIsSaving);
  const setLastSavedRef = useRef(setLastSaved);
  
  useEffect(() => {
    setIsDirtyRef.current = setIsDirty;
    setIsSavingRef.current = setIsSaving;
    setLastSavedRef.current = setLastSaved;
  });

  useEffect(() => {
    if (!strategyId || !user?.id) {
      stopAutosave();
      return;
    }

    const getCurrentData = () => {
      // Try to get compiled JSON first, fallback to parsed JSON text
      const json = compiledJSON || (jsonText ? JSON.parse(jsonText) : undefined);
      
      return {
        strategy_json: json,
        strategy_tql: tqlText || undefined,
        strategy_blocks: blockTree || undefined,
      };
    };

    const isValid = () => {
      return compileResult?.valid === true;
    };

    const onSave = (success: boolean) => {
      if (success) {
        setIsSavingRef.current(false);
        setLastSavedRef.current(new Date());
        setIsDirtyRef.current(false);
      }
    };

    // Start autosave
    startAutosave(strategyId, user.id, getCurrentData, isValid, onSave);

    return () => {
      stopAutosave();
    };
  }, [
    strategyId,
    user?.id,
    tqlText,
    jsonText,
    blockTree,
    compiledJSON,
    compileResult?.valid,
    // FIXED: Removed setIsDirty, setIsSaving, setLastSaved from deps - using refs instead
  ]);

  // Manual save function
  const saveNow = async () => {
    if (!strategyId || !user?.id || !compileResult?.valid) {
      return false;
    }

    setIsSaving(true);
    try {
      const json = compiledJSON || (jsonText ? JSON.parse(jsonText) : undefined);
      
      await uploadStrategy(strategyId, user.id, {
        strategy_json: json,
        strategy_tql: tqlText || undefined,
        strategy_blocks: blockTree || undefined,
      });

      setIsDirty(false);
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveNow };
}

