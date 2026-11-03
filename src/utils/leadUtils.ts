import { Lead } from '@/types';

/**
 * Utility functions for Lead data transformations
 * Bridges the gap between database schema and UI expectations
 */

/**
 * Get full name from first_name and last_name
 */
export function getLeadName(lead: Lead): string {
  return `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown';
}

/**
 * Get lead temperature from status and metadata
 * Maps status/metadata to temperature values for UI
 */
export function getLeadTemperature(lead: Lead): number {
  // Check lead_metadata for AI analysis score first
  const aiScore = lead.lead_metadata?.ai_analysis?.lead_qualification?.confidence_score;
  if (aiScore !== undefined && aiScore !== null) {
    return aiScore;
  }

  // Check lead_metadata for manual lead score
  const leadScore = lead.lead_metadata?.lead_score;
  if (leadScore !== undefined && leadScore !== null) {
    return leadScore;
  }

  // Fallback: derive from status values (both numeric and string)
  const status = lead.status;
  
  // Handle string status values (new system)
  if (typeof status === 'string') {
    switch (status.toLowerCase()) {
      case 'dead':
      case 'on-hold':
        return 0;     // Failed/Dead leads
      case 'engaged':
      case 'qualified':
      case 'clarifying':
      case 'booked':
      case 'follow-up':
      case 'hot':
        return 90;    // Completed/Success leads
      case 'questions-asked':
        return 80;    // Active leads
      case 'hook':
      case 'value-proposition':
      case 'warm':
      case 'contacted':
        return 60;    // Queued leads
      case 'new':
      case 'pre-qualified':
      case 'unqualified':
        return 40;    // Pending leads
      case 'cold':
        return 30;
      default:
        return 50;
    }
  }
  
  // Handle numeric status values (legacy system)
  if (typeof status === 'number') {
    if (status >= 11) return 0;     // Failed/Dead leads
    if (status >= 6) return 90;     // Completed/Success leads  
    if (status === 5) return 80;    // Active leads
    if (status >= 3) return 60;     // Queued leads
    if (status >= 1) return 40;     // Pending leads
  }

  return 50; // neutral default
}

/**
 * Get lead company/organization name
 * Uses client relationship or metadata
 */
export function getLeadCompany(lead: Lead): string | null {
  // Check if we have custom fields in metadata
  const customFields = lead.lead_metadata?.custom_fields;
  if (customFields?.company) {
    return customFields.company;
  }
  
  // For now, return null as company is being deprecated
  // TODO: Could be computed from client relationship if needed
  return null;
}

/**
 * Get lead heat level from temperature
 */
export function getHeatLevelFromTemperature(temperature: number | string): 'cold' | 'warm' | 'hot' | 'burning' {
  // Demo data stores the label itself ("hot") instead of a 0-100 score
  if (typeof temperature === 'string') {
    const label = temperature.toLowerCase();
    if (label === 'burning' || label === 'hot' || label === 'warm' || label === 'cold') return label;
    temperature = Number(temperature) || 0;
  }
  if (temperature >= 80) return 'burning';
  if (temperature >= 60) return 'hot';
  if (temperature >= 40) return 'warm';
  return 'cold';
}

export type HeatScaleLevel = 'FROZEN' | 'ICE_COLD' | 'COLD' | 'COOL' | 'WARM' | 'HOT' | 'BURNING' | 'WHITE_HOT';

const HEAT_SCALE_LEVELS: HeatScaleLevel[] = ['FROZEN', 'ICE_COLD', 'COLD', 'COOL', 'WARM', 'HOT', 'BURNING', 'WHITE_HOT'];

/**
 * Seven-step heat level from a 0-100 temperature score. Demo data stores labels
 * ("hot") instead of scores; those used to parse as NaN and land in FROZEN, so the
 * /leads "Hot Leads" card always showed 0.
 */
export function getHeatScaleLevel(temperature: number | string | null | undefined): HeatScaleLevel {
  if (temperature === null || temperature === undefined) return 'FROZEN';
  if (typeof temperature === 'string') {
    const label = temperature.trim().toUpperCase().replace(/[\s-]+/g, '_') as HeatScaleLevel;
    if (HEAT_SCALE_LEVELS.includes(label)) return label;
  }
  const temp = typeof temperature === 'string' ? parseInt(temperature, 10) : temperature;
  if (isNaN(temp)) return 'FROZEN';

  if (temp <= 10) return 'FROZEN';
  if (temp <= 20) return 'ICE_COLD';
  if (temp <= 35) return 'COLD';
  if (temp <= 50) return 'COOL';
  if (temp <= 65) return 'WARM';
  if (temp <= 80) return 'HOT';
  if (temp <= 95) return 'BURNING';
  return 'WHITE_HOT';
}

/**
 * Get display temperature with proper formatting
 */
export function getDisplayTemperature(temperature: number): string {
  return `${Math.round(temperature)}°`;
}

/**
 * Get temperature badge variant for UI
 */
export function getTemperatureVariant(temperature: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  const heat = getHeatLevelFromTemperature(temperature);
  switch (heat) {
    case 'burning':
      return 'destructive';
    case 'hot':
      return 'default';
    case 'warm':
      return 'secondary';
    case 'cold':
    default:
      return 'outline';
  }
}

/**
 * Check if lead has active conversation
 * Based on lead metadata or processing state
 */
export function hasActiveConversation(lead: Lead): boolean {
  return lead.processing_state === 'active' || 
         lead.hasActiveConversation === true ||
         (lead.messageCount || 0) > 0;
}

/**
 * Get lead notes from metadata
 */
export function getLeadNotes(lead: Lead): string | null {
  // Check custom fields for notes
  const customFields = lead.lead_metadata?.custom_fields;
  return customFields?.notes || null;
}

/**
 * Get lead location from metadata
 */
export function getLeadLocation(lead: Lead): string | null {
  const customFields = lead.lead_metadata?.custom_fields;
  return customFields?.location || customFields?.address || null;
} 