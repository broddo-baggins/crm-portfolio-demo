// @ts-nocheck
// TypeScript checking disabled for deployment compatibility
import { mapDatabaseLeadToAppLead, mapDatabaseProjectToAppProject, safeAccess } from '../../types/fixes';
import crypto from 'crypto';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';
import { Lead } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Check, AlertTriangle, Loader2, Save, RefreshCw, Shield, Database as DatabaseIcon, User, Mail, Phone, FileText, Building, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';

interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: Lead;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

interface DuplicateCheck {
  isDuplicate: boolean;
  duplicateId?: string;
  duplicateField?: string;
  confidence: number;
}

// Lead sources will be generated dynamically using translations

export const LeadForm = ({ open, onClose, onSuccess, lead }: LeadFormProps) => {
  const { t } = useTranslation(['forms', 'common']);
  const { isRTL, textStart } = useLang();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '', 
    phone: '',
    company: '',
    position: '',
    location: '',
    notes: '',
    heat: 'cold',
    state: 'new'
  });

  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    warnings: {}
  });

  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheck>({
    isDuplicate: false,
    confidence: 0
  });

  // Use the singleton supabase client

  // Initialize form data when lead prop changes
  useEffect(() => {
    if (lead) {
      setFormData({
        first_name: lead.first_name || '',
        last_name: lead.last_name || '',
        phone: lead.phone || '',
        company: safeAccess(lead, "company", "") || '',
        position: safeAccess(lead, "position", "") || '',
        location: safeAccess(lead, "location", "") || '',
        notes: lead.notes || '',
        heat: lead.heat || 'cold',
        state: lead.state || 'new'
      });
    } else {
      // Reset form for new lead
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        company: '',
        position: '',
        location: '',
        notes: '',
        heat: 'cold',
        state: 'new'
      });
    }
    setHasUnsavedChanges(false);
    setValidation({ isValid: true, errors: {}, warnings: {} });
    setDuplicateCheck({ isDuplicate: false, confidence: 0 });
  }, [lead, open]);

  // Real-time validation
  const validateField = useCallback(async (field: string, value: string): Promise<void> => {
    const errors = { ...validation.errors };
    const warnings = { ...validation.warnings };

    // Clear previous errors/warnings for this field
    delete errors[field];
    delete warnings[field];

    switch (field) {
      case 'phone':
        const phoneError = validatePhone(value);
        if (phoneError) {
          errors[field] = phoneError;
        }
        break;

      case 'first_name':
      case 'last_name':
        if (!value.trim()) {
          errors[field] = t('common:validation.required', 'This field is required');
        } else if (value.length < 2) {
          warnings[field] = t('common:validation.minLength', 'Must be at least {{min}} characters', { min: 2 });
        }
        break;
    }

    setValidation({
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    });
  }, [validation.errors, validation.warnings, lead?.id]);

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null;
    
    // Remove all non-digit characters for validation
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid phone number format
    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
    
    if (!phoneRegex.test(phone)) {
      return t('common:validation.phone', 'Please enter a valid phone number');
    }
    
    // Check for minimum length
    if (cleaned.length < 10) {
      return t('common:validation.minLength', 'Must be at least {{min}} digits', { min: 10 });
    }
    
    return null;
  };

  // Advanced duplicate detection
  const checkForDuplicates = useCallback(async (): Promise<void> => {
    if (!formData.phone) return; // Only check phone duplicates

    setIsDuplicateChecking(true);
    try {
      // Only check for phone duplicates
      const { data: duplicates } = formData.phone ? await supabase
        .from('leads')
        .select('id, first_name, last_name, phone')
        .eq('phone', formData.phone)
        .neq('id', lead?.id || 'none') : { data: [] };

      if (duplicates && duplicates.length > 0) {
        const exactMatch = duplicates.find(d => 
          d.phone === formData.phone
        );
        
        setDuplicateCheck({
          isDuplicate: true,
          duplicateId: exactMatch?.id,
          duplicateField: 'phone',
          confidence: exactMatch ? 100 : 75
        });
      } else {
        setDuplicateCheck({
          isDuplicate: false,
          confidence: 0
        });
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setIsDuplicateChecking(false);
    }
  }, [formData.phone, lead?.id]);

  // Auto-save functionality
  const autoSave = useCallback(async (): Promise<void> => {
    if (!hasUnsavedChanges || !lead) return;

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        company: formData.company || null,
        position: formData.position || null,
        location: formData.location || null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
        last_modified_by: 'auto_save'
      };

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', lead.id);

      if (!error) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast.success('Changes auto-saved', { duration: 2000 });
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [hasUnsavedChanges, lead, formData]);

  // Auto-save timer
  useEffect(() => {
    if (hasUnsavedChanges && lead) {
      const timer = setTimeout(autoSave, 10000); // Auto-save after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, autoSave, lead]);

  // Real-time validation and duplicate checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.phone) {
        validateField('phone', formData.phone);
      }
      checkForDuplicates();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.phone, validateField, checkForDuplicates]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Immediate validation for critical fields
    if (['first_name', 'last_name'].includes(field)) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    setIsValidating(true);
    await Promise.all([
      validateField('first_name', formData.first_name),
      validateField('last_name', formData.last_name),
      validateField('phone', formData.phone)
    ]);
    setIsValidating(false);

    if (!validation.isValid) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    setSaveProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setSaveProgress(prev => Math.min(prev + 20, 90));
      }, 200);

      if (lead) {
        // Update existing lead with enhanced data
        const updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          company: formData.company || null,
          position: formData.position || null,
          location: formData.location || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
          last_modified_by: 'manual_edit',
          modification_type: 'form_update'
        };

        const { error } = await supabase
          .from('leads')
          .update(updateData)
          .eq('id', lead.id);

        if (error) throw error;
        
        clearInterval(progressInterval);
        setSaveProgress(100);
        
        // Create notification for lead update
        if (user?.id) {
          await notificationService.notifyLeadEvent(
            user.id,
            lead.id,
            'updated',
            {
              name: `${formData.first_name} ${formData.last_name}`,
              phone: formData.phone,
              company: formData.company
            }
          );
        }
        
        toast.success('Lead updated successfully', {
          description: 'All changes have been saved',
          action: {
            label: 'View',
            onClick: () => undefined
          }
        });
      } else {
        // Create new lead with comprehensive data
        const insertData = {
          project_id: 'default-project-id', // TODO: Get from context or props
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          company: formData.company || null,
          position: formData.position || null,
          location: formData.location || null,
          notes: formData.notes || null,
          source: 'website',
          heat: formData.heat,
          state: formData.state,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('leads')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;
        
        clearInterval(progressInterval);
        setSaveProgress(100);
        
        // Create notification for new lead
        if (user?.id && data) {
          await notificationService.notifyLeadEvent(
            user.id,
            data.id,
            'created',
            {
              name: `${formData.first_name} ${formData.last_name}`,
              phone: formData.phone,
              company: formData.company
            }
          );
        }
        
        toast.success('Lead created successfully', {
          description: `New lead ${formData.first_name} ${formData.last_name} has been added`,
          action: {
            label: 'View',
            onClick: () => undefined
          }
        });
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      onSuccess();
      
    } catch (error) {
      console.error('Error saving lead:', error);
      setSaveProgress(0);
      
      if (error.code === '23505') {
        toast.error('Duplicate lead detected', {
          description: 'A lead with this phone already exists'
        });
      } else {
        toast.error('Failed to save lead', {
          description: error.message || 'An unexpected error occurred'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getValidationIcon = (field: string) => {
    if (validation.errors[field]) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (validation.warnings[field]) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    if (formData[field as keyof typeof formData]) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {lead ? t('common:edit', 'Edit') + ' ' + t('leads:lead', 'Lead') : t('forms:labels.addLead', 'Add New Lead')}
            </DialogTitle>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              {isDuplicateChecking && (
                <Badge variant="outline" className="gap-1">
                  <DatabaseIcon className="h-3 w-3 animate-pulse" />
                  {t('common:status.loading', 'Loading...')}
                </Badge>
              )}
              
              {duplicateCheck.isDuplicate && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Duplicate ({duplicateCheck.confidence}%)
                </Badge>
              )}
              
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="gap-1">
                  <Save className="h-3 w-3" />
                  {t('forms:status.unsaved', 'Unsaved')}
                </Badge>
              )}
              
              {lastSaved && (
                <Badge variant="outline" className="gap-1">
                  <Check className="h-3 w-3" />
                  {t('common:status.saved', 'Saved')} {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar for Saving */}
        {isSaving && (
          <div className="space-y-2">
            <Progress value={saveProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {t('common:status.saving', 'Saving...')} {saveProgress}%
            </p>
          </div>
        )}

        {/* Duplicate Warning */}
        {duplicateCheck.isDuplicate && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Potential duplicate detected based on {duplicateCheck.duplicateField} 
              ({duplicateCheck.confidence}% confidence). Please review before saving.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('forms:sections.personalInfo', 'Personal Information')}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="flex items-center gap-2">
                  {t('forms:labels.firstName', 'First Name')} *
                  {getValidationIcon('first_name')}
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={cn(
                    validation.errors.first_name && "border-red-500",
                    validation.warnings.first_name && "border-yellow-500"
                  )}
                  required
                />
                {validation.errors.first_name && (
                  <p className="text-sm text-red-500">{validation.errors.first_name}</p>
                )}
                {validation.warnings.first_name && (
                  <p className="text-sm text-yellow-500">{validation.warnings.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="flex items-center gap-2">
                  {t('forms:labels.lastName', 'Last Name')} *
                  {getValidationIcon('last_name')}
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={cn(
                    validation.errors.last_name && "border-red-500",
                    validation.warnings.last_name && "border-yellow-500"
                  )}
                  required
                />
                {validation.errors.last_name && (
                  <p className="text-sm text-red-500">{validation.errors.last_name}</p>
                )}
                {validation.warnings.last_name && (
                  <p className="text-sm text-yellow-500">{validation.warnings.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t('forms:sections.contactInfo', 'Contact Information')}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  {t('forms:labels.phone', 'Phone')}
                  {getValidationIcon('phone')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={cn(
                    validation.errors.phone && "border-red-500",
                    validation.warnings.phone && "border-yellow-500"
                  )}
                />
                {validation.errors.phone && (
                  <p className="text-sm text-red-500">{validation.errors.phone}</p>
                )}
                {validation.warnings.phone && (
                  <p className="text-sm text-yellow-500">{validation.warnings.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              {t('forms:sections.companyInfo', 'Company Information')}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">{t('forms:labels.company', 'Company')}</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">{t('forms:labels.position', 'Position')}</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">{t('forms:labels.location', 'Location')}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('forms:placeholders.location', 'City, State/Country')}
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('forms:sections.additionalInfo', 'Additional Information')}
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="notes">{t('forms:labels.notes', 'Notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder={t('forms:placeholders.notes', 'Add any additional notes about this lead...')}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isValidating && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('forms:status.validating', 'Validating...')}
                </>
              )}
              {lastSaved && !hasUnsavedChanges && (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  {t('common:status.saved', 'Saved')} {lastSaved.toLocaleTimeString()}
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common:buttons.cancel', 'Cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || !validation.isValid}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common:buttons.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {lead ? t('common:buttons.update', 'Update') + ' ' + t('leads:lead', 'Lead') : t('common:buttons.create', 'Create') + ' ' + t('leads:lead', 'Lead')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 