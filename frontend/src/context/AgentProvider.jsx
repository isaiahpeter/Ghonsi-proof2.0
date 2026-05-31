'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as agentApi from '@/utils/agentApi';
import { useAuth } from '@/hooks/useAuth';

/**
 * Agent Context - Manages agent state across app
 */

const AgentContext = createContext();

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgent must be used within AgentProvider');
  return context;
};

export const AgentProvider = ({ children }) => {
  const [agent, setAgent] = useState(null);
  const [agentSummary, setAgentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();

  const fetchAgentData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const summary = await agentApi.getAgentSummary(user.id);
      setAgentSummary(summary);
      
      const agentData = await agentApi.getAgentForUser(user.id);
      setAgent(agentData);
      
      if (agentData?.id) {
        const agentTasks = await agentApi.getAgentTasks(agentData.id, { status: 'pending_approval' });
        setTasks(agentTasks || []);
      }
    } catch (error) {
      console.error('fetchAgentData error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const activateAgent = async (config) => {
    try {
      const result = await agentApi.activateAgentForUser(user.id, config);
      await fetchAgentData();
      return result;
    } catch (error) {
      console.error('activateAgent error:', error);
      throw error;
    }
  };

  const refreshAgent = useCallback(() => fetchAgentData(), [fetchAgentData]);

  useEffect(() => {
    if (user?.id) {
      fetchAgentData();
    } else {
      setAgent(null);
      setAgentSummary(null);
      setLoading(false);
    }
  }, [user?.id, fetchAgentData]);

  const value = {
    agent,
    agentSummary,
    tasks,
    loading,
    activateAgent,
    refreshAgent,
    setAgentStatus: agentApi.setAgentStatusForUser,
    scanProofs: agentApi.scanUserProofsWithAgent
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

