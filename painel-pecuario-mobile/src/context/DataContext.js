import React, { createContext, useContext, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";
import { normalizeFarmReferences } from "../utils/livestock";

const CACHE_KEY = "fdl_data_cache";
const REVISION_KEY = "fdl_data_revision";

const TOTAL_ID = "__TOTAL__";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [revision, setRevision] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  const pull = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const response = await api.getData();
      const rev = Number(response.revision || 0);
      if (response.payload) {
        const normalized = ensureShape(response.payload);
        setData(normalized);
        setRevision(rev);
        setLastSync(new Date());
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
        await AsyncStorage.setItem(REVISION_KEY, String(rev));
      }
      return response.payload;
    } catch (err) {
      setError(err.message || "Erro ao sincronizar.");
      // Try to restore from cache
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        const cachedRev = await AsyncStorage.getItem(REVISION_KEY);
        if (cached && !data) {
          setData(ensureShape(JSON.parse(cached)));
          setRevision(Number(cachedRev || 0));
        }
      } catch {
        // ignore cache errors
      }
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [data]);

  const push = useCallback(async (newData) => {
    setSyncing(true);
    try {
      const payload = serializeForApi(newData);
      // Strip session-specific fields before sending
      if (payload.auth) {
        payload.auth.sessionUserId = "";
      }
      const response = await api.saveData(payload, revision);
      const newRev = Number(response.revision || revision);
      setData(newData);
      setRevision(newRev);
      setLastSync(new Date());
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newData));
      await AsyncStorage.setItem(REVISION_KEY, String(newRev));
      return newRev;
    } catch (err) {
      if (err.status === 409) {
        throw new Error("CONFLICT");
      }
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [revision]);

  // Convenience: update data and push to server
  const save = useCallback(async (newData) => {
    setData(newData);
    return push(newData);
  }, [push]);

  return (
    <DataContext.Provider value={{
      data,
      revision,
      syncing,
      lastSync,
      error,
      pull,
      push,
      save,
      TOTAL_ID,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

function ensureShape(raw) {
  if (!raw || typeof raw !== "object") return raw;

  const next = JSON.parse(JSON.stringify(raw));

  if (!Array.isArray(next.farms)) {
    if (next.farms && typeof next.farms === "object") {
      next.farms = Object.entries(next.farms).map(([farmId, farm]) => ({
        id: farm?.id || farmId,
        ...farm,
      }));
    } else {
      next.farms = [];
    }
  }

  next.farms.forEach((farm) => {
    normalizeFarmReferences(farm);
  });

  return next;
}

function serializeForApi(data) {
  const payload = JSON.parse(JSON.stringify(data));

  if (Array.isArray(payload.farms)) {
    payload.farms = payload.farms.reduce((acc, farm, index) => {
      const farmId = farm?.id || `farm-${index + 1}`;
      acc[farmId] = {
        ...farm,
        id: farmId,
      };
      return acc;
    }, {});
  }

  return payload;
}
