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
        setIsSaving(false);
        setLastSaved(new Date());
        setIsDirty(false);
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
    setIsDirty,
    setIsSaving,
    setLastSaved,
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

