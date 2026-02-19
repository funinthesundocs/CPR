import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import FormWizard from '../components/wizard/FormWizard';
import WizardNavigation from '../components/wizard/WizardNavigation';
import Step1DefendantInfo from '../components/newcase/Step1DefendantInfo';
import Step2Relationship from '../components/newcase/Step2Relationship';
import Step3Promise from '../components/newcase/Step3Promise';
import Step4Betrayal from '../components/newcase/Step4Betrayal';
import Step5FinancialImpact from '../components/newcase/Step5FinancialImpact';
import Step6PersonalImpact from '../components/newcase/Step6PersonalImpact';
import Step7Timeline from '../components/newcase/Step7Timeline';
import Step9OthersAffected from '../components/newcase/Step9OthersAffected';
import Step10LegalActions from '../components/newcase/Step10LegalActions';
import Step11Narrative from '../components/newcase/Step11Narrative';
import Step12VisibilitySafety from '../components/newcase/Step12VisibilitySafety';
import { NewCaseFormData, initialFormData } from '../types/newCaseForm';
import { AlertCircle, CheckCircle, Download } from 'lucide-react';
import Toast from '../components/Toast';

const FORM_STEPS = [
  { title: 'Defendant Info', description: 'Who caused the harm?' },
  { title: 'Your Connection', description: 'How did you meet them?' },
  { title: 'The Promise', description: 'What were you promised?' },
  { title: 'The Betrayal', description: 'What went wrong?' },
  { title: 'Financial Impact', description: 'Quantify the monetary harm' },
  { title: 'Personal Impact', description: 'Emotional and life effects' },
  { title: 'Build Timeline', description: 'Chronological events' },
  { title: 'Others Affected', description: 'Witnesses and victims' },
  { title: 'Legal Actions', description: 'Remedies attempted' },
  { title: 'Tell Your Story', description: 'Narrative and summary' },
  { title: 'Visibility', description: 'Privacy and safety' },
  { title: 'Review & Submit', description: 'Final review' },
];

export default function NewCaseForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { caseId } = useParams<{ caseId: string }>();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NewCaseFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [actualCaseId, setActualCaseId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthentication();
    if (caseId) {
      loadExistingCase();
    } else {
      loadSavedProgress();
    }
  }, [caseId]);

  async function checkAuthentication() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication check error:', error);
      setIsAuthenticated(false);
      navigate('/login');
    }
  }

  async function loadExistingCase() {
    setLoading(true);
    try {
      console.log('=== LOAD EXISTING CASE CALLED ===');
      console.log('Case ID:', caseId);

      const { data: { user } } = await supabase.auth.getUser();
      console.log('Logged-in User ID:', user?.id);

      if (!user) {
        console.error('No user - redirecting to login');
        navigate('/login');
        return;
      }

      // Check if this is an admin viewing another user's case
      const queryUserId = searchParams.get('userId');
      const isAdminRoute = location.pathname.startsWith('/admin/');

      let effectiveUserId = user.id;

      if (queryUserId && isAdminRoute) {
        // Verify the logged-in user is actually an admin
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profile?.user_type === 'admin' || profile?.user_type === 'super_admin') {
          effectiveUserId = queryUserId;
          setIsAdminView(true);
          setTargetUserId(queryUserId);
          console.log('✅ Admin viewing user:', queryUserId);
        } else {
          console.warn('⚠️ Non-admin tried to use userId param, ignoring');
        }
      } else if (queryUserId && !isAdminRoute) {
        // Public route should NEVER use another user's ID
        console.warn('⚠️ Security: Ignoring userId param on public route');
      }

      console.log('Effective User ID for query:', effectiveUserId);

      // PRIORITY 1: Check case_form_progress for saved draft (most recent edits)
      console.log('Checking case_form_progress...');
      const { data: progressData, error: progressError } = await supabase
        .from('case_form_progress')
        .select('*')
        .eq('user_id', effectiveUserId)
        .eq('case_id', caseId)
        .maybeSingle();

      console.log('Progress data result:', { progressData, progressError });

      if (progressData && progressData.form_data) {
        console.log('✅ SUCCESS: Loading from case_form_progress');
        console.log('Form data keys:', Object.keys(progressData.form_data));
        console.log('Timeline events:', progressData.form_data.step7?.timelineEvents?.length);
        setFormData(progressData.form_data as NewCaseFormData);
        setCurrentStep(progressData.current_step);
        setIsEditMode(true);
        setLoading(false);
        setToast({ message: 'Case loaded successfully!', type: 'success' });
        return;
      }

      console.log('⚠️ No data in case_form_progress, checking pending_case_submissions...');

      // PRIORITY 2: Check pending_case_submissions for submitted case data
      // First try to load by submission ID (when clicking from plaintiff management)
      let submissionData = null;
      let submissionError = null;

      const submissionById = await supabase
        .from('pending_case_submissions')
        .select('*')
        .eq('id', caseId)
        .maybeSingle();

      if (submissionById.data && submissionById.data.submitted_by === effectiveUserId) {
        submissionData = submissionById.data;
        setActualCaseId(submissionById.data.matched_to_case_id);
        console.log('✅ Found submission by ID');
      } else {
        // Fall back to matching by case ID
        const submissionByCase = await supabase
          .from('pending_case_submissions')
          .select('*')
          .eq('submitted_by', effectiveUserId)
          .eq('matched_to_case_id', caseId)
          .maybeSingle();

        submissionData = submissionByCase.data;
        submissionError = submissionByCase.error;
        if (submissionByCase.data) {
          setActualCaseId(submissionByCase.data.matched_to_case_id);
        }
      }

      if (submissionError) {
        console.error('Error loading submission data:', submissionError);
      }

      if (submissionData && submissionData.case_data) {
        console.log('Loading from pending_case_submissions');
        const transformedData = transformSubmissionToFormData(submissionData.case_data);
        setFormData(transformedData);
        setIsEditMode(true);
      } else {
        // PRIORITY 3: Fallback to basic case info from cases table
        console.log('Loading basic info from cases table');
        const { data: caseData, error: caseError } = await supabase
          .from('cases')
          .select('*')
          .eq('id', caseId)
          .maybeSingle();

        if (caseError || !caseData) {
          console.error('Error loading case:', caseError);
          setToast({ message: 'Failed to load case data', type: 'error' });
          navigate('/admin/plaintiffs');
          return;
        }

        const basicFormData: NewCaseFormData = {
          ...initialFormData,
          step1: {
            ...initialFormData.step1,
            defendantFirstName: caseData.defendant_first_name || '',
            defendantMiddleName: caseData.defendant_middle_name || '',
            defendantLastName: caseData.defendant_last_name || '',
            defendantFullName: `${caseData.defendant_first_name || ''} ${caseData.defendant_middle_name || ''} ${caseData.defendant_last_name || ''}`.trim(),
            caseTypes: caseData.case_type || [],
            dateRange: caseData.date_range || '',
            customLabel1: caseData.custom_label_1 || '',
            customValue1: caseData.custom_value_1 || '',
            defendantPhoto: caseData.defendant_photo_url || '',
          },
          step11: {
            ...initialFormData.step11,
            oneSentenceSummary: caseData.summary?.substring(0, 200) || '',
            detailedNarrative: caseData.summary || '',
            tagline: caseData.tagline || '',
            summaryHeadline: caseData.summary_headline || '',
            timelineHeadline: caseData.timeline_headline || '',
            evidenceHeadline: caseData.evidence_headline || '',
            heroMediaUrls: caseData.hero_media_urls || [],
          }
        };
        setFormData(basicFormData);
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Error loading case:', error);
      setToast({ message: 'Unexpected error loading case', type: 'error' });
      navigate('/admin/plaintiffs');
    } finally {
      setLoading(false);
    }
  }

  function transformSubmissionToFormData(caseData: any): NewCaseFormData {
    // The case_data from pending_case_submissions already has the step1-step13 structure
    // We just need to merge it with initialFormData to ensure all fields exist
    return {
      step1: { ...initialFormData.step1, ...(caseData.step1 || {}) },
      step2: { ...initialFormData.step2, ...(caseData.step2 || {}) },
      step3: { ...initialFormData.step3, ...(caseData.step3 || {}) },
      step4: { ...initialFormData.step4, ...(caseData.step4 || {}) },
      step5: { ...initialFormData.step5, ...(caseData.step5 || {}) },
      step6: { ...initialFormData.step6, ...(caseData.step6 || {}) },
      step7: { ...initialFormData.step7, ...(caseData.step7 || {}) },
      step8: { ...initialFormData.step8, ...(caseData.step8 || {}) },
      step9: { ...initialFormData.step9, ...(caseData.step9 || {}) },
      step10: { ...initialFormData.step10, ...(caseData.step10 || {}) },
      step11: { ...initialFormData.step11, ...(caseData.step11 || {}) },
      step12: { ...initialFormData.step12, ...(caseData.step12 || {}) },
      step13: { ...initialFormData.step13, ...(caseData.step13 || {}) },
    };
  }

  async function loadSavedProgress() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('case_form_progress')
        .select('*')
        .eq('user_id', user.id)
        .is('case_id', null)
        .order('last_saved_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && !error) {
        setHasSavedDraft(true);
        setShowDraftBanner(true);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }

  async function resumeDraft() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('case_form_progress')
        .select('*')
        .eq('user_id', user.id)
        .is('case_id', null)
        .order('last_saved_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && !error) {
        const latestDraft = data[0];
        setFormData(latestDraft.form_data as NewCaseFormData);
        setCurrentStep(latestDraft.current_step);
        setShowDraftBanner(false);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  async function startFresh() {
    setFormData(initialFormData);
    setCurrentStep(1);
    setShowDraftBanner(false);
    setHasSavedDraft(false);
  }

  async function saveProgress() {
    console.log('=== SAVE PROGRESS CALLED ===');
    console.log('Current Step:', currentStep);
    console.log('Form Data:', formData);
    console.log('Is Edit Mode:', isEditMode);
    console.log('Case ID:', caseId);

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User ID:', user?.id);

      if (!user) {
        console.error('No user found - cannot save');
        setToast({ message: 'You must be logged in to save progress', type: 'error' });
        return;
      }

      if (isEditMode && caseId) {
        // EDIT MODE: Save to BOTH pending_case_submissions AND case_form_progress
        console.log('Saving in EDIT MODE to pending_case_submissions AND case_form_progress');

        // Determine which user ID to use for saving
        const saveUserId = isAdminView && targetUserId ? targetUserId : user.id;
        console.log('Save User ID:', saveUserId, '(Admin view:', isAdminView, ')');

        // Save to pending_case_submissions
        // If caseId is a submission ID, update by id, otherwise by matched_to_case_id
        let submissionError = null;
        if (actualCaseId) {
          // We loaded from submission ID, so update by submission ID
          const result = await supabase
            .from('pending_case_submissions')
            .update({
              defendant_full_name: formData.step1.defendantFullName,
              defendant_email: formData.step1.socialMediaProfiles.find(p => p.platform === 'email')?.url || null,
              defendant_phone: null,
              defendant_address: formData.step1.defendantLocation || null,
              case_data: formData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', caseId)
            .eq('submitted_by', saveUserId);
          submissionError = result.error;
        } else {
          // We loaded from case ID, update by matched_to_case_id
          const result = await supabase
            .from('pending_case_submissions')
            .update({
              defendant_full_name: formData.step1.defendantFullName,
              defendant_email: formData.step1.socialMediaProfiles.find(p => p.platform === 'email')?.url || null,
              defendant_phone: null,
              defendant_address: formData.step1.defendantLocation || null,
              case_data: formData,
              updated_at: new Date().toISOString(),
            })
            .eq('matched_to_case_id', caseId)
            .eq('submitted_by', saveUserId);
          submissionError = result.error;
        }

        // ALSO save to case_form_progress with the ACTUAL case_id for draft restoration
        // Use actualCaseId if available (when loaded from submission), otherwise use caseId
        const useCaseId = actualCaseId || caseId;
        const { error: progressError } = await supabase.from('case_form_progress').upsert(
          {
            user_id: saveUserId,
            case_id: useCaseId,
            current_step: currentStep,
            form_data: formData,
            last_saved_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,case_id'
          }
        );

        if (submissionError || progressError) {
          console.error('=== SAVE ERROR (EDIT MODE) ===');
          console.error('Submission error:', submissionError);
          console.error('Progress error:', progressError);
          setToast({ message: `Save failed: ${submissionError?.message || progressError?.message}`, type: 'error' });
        } else {
          console.log('=== SAVE SUCCESS (EDIT MODE) ===');
          setToast({ message: 'Case progress saved successfully!', type: 'success' });
          setHasSavedDraft(true);
        }
      } else {
        // NEW CASE MODE: Save to case_form_progress with case_id = null
        console.log('Saving in NEW CASE MODE to case_form_progress');
        const saveData = {
          user_id: user.id,
          case_id: null,
          current_step: currentStep,
          form_data: formData,
          last_saved_at: new Date().toISOString(),
        };

        console.log('Attempting to save:', saveData);

        const { data, error } = await supabase.from('case_form_progress').upsert(
          saveData,
          {
            onConflict: 'user_id,case_id'
          }
        ).select();

        if (error) {
          console.error('=== SAVE ERROR ===');
          console.error('Error details:', error);
          setToast({ message: `Save failed: ${error.message}`, type: 'error' });
        } else {
          console.log('=== SAVE SUCCESS ===');
          console.log('Saved data:', data);
          setToast({ message: 'Progress saved successfully!', type: 'success' });
          setHasSavedDraft(true);
        }
      }
    } catch (error) {
      console.error('=== SAVE EXCEPTION ===');
      console.error('Exception details:', error);
      setToast({ message: 'Unexpected error saving progress', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function loadLastSavedData() {
    console.log('=== LOAD LAST SAVED DATA CALLED ===');
    setLoadingDraft(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User ID:', user?.id);

      if (!user) {
        console.error('No user found - cannot load');
        setToast({ message: 'You must be logged in to load saved data', type: 'error' });
        return;
      }

      const { data, error } = await supabase
        .from('case_form_progress')
        .select('*')
        .eq('user_id', user.id)
        .is('case_id', null)
        .order('last_saved_at', { ascending: false })
        .limit(1);

      console.log('Load query result:', { data, error });

      if (error) {
        console.error('=== LOAD ERROR ===');
        console.error('Error details:', error);
        setToast({ message: `Load failed: ${error.message}`, type: 'error' });
      } else if (!data || data.length === 0) {
        console.log('No saved draft found');
        setToast({ message: 'No saved draft found', type: 'error' });
      } else {
        const latestDraft = data[0];
        console.log('=== LOAD SUCCESS ===');
        console.log('Loaded data:', latestDraft);
        setFormData(latestDraft.form_data as NewCaseFormData);
        setCurrentStep(latestDraft.current_step);
        setShowDraftBanner(false);
        setHasSavedDraft(true);
        setToast({ message: `Draft loaded! (Step ${latestDraft.current_step})`, type: 'success' });
      }
    } catch (error) {
      console.error('=== LOAD EXCEPTION ===');
      console.error('Exception details:', error);
      setToast({ message: 'Unexpected error loading saved data', type: 'error' });
    } finally {
      setLoadingDraft(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isEditMode && caseId) {
        // UPDATE existing case - save to both pending_case_submissions and cases table

        // Update the pending_case_submissions with the full form data
        const { error: submissionUpdateError } = await supabase
          .from('pending_case_submissions')
          .update({
            defendant_full_name: formData.step1.defendantFullName,
            defendant_email: formData.step1.socialMediaProfiles.find(p => p.platform === 'email')?.url || null,
            defendant_phone: null,
            defendant_address: formData.step1.defendantLocation || null,
            case_data: formData,
            updated_at: new Date().toISOString(),
          })
          .eq('matched_to_case_id', caseId);

        if (submissionUpdateError) {
          console.error('Error updating submission:', submissionUpdateError);
        }

        // Also update the cases table with key fields
        const { error: caseUpdateError } = await supabase
          .from('cases')
          .update({
            case_name: formData.step1.defendantFullName,
            alias: formData.step1.defendantAliases[0] || null,
            summary: formData.step11?.detailedNarrative || 'Case details pending review',
            case_type: formData.step1.caseTypes || [],
            defendant_first_name: formData.step1.defendantFirstName,
            defendant_middle_name: formData.step1.defendantMiddleName,
            defendant_last_name: formData.step1.defendantLastName,
            tagline: formData.step11?.tagline || null,
            date_range: formData.step1?.dateRange || null,
            custom_label_1: formData.step1?.customLabel1 || null,
            custom_value_1: formData.step1?.customValue1 || null,
            defendant_photo_url: formData.step1?.defendantPhoto || null,
            hero_media_urls: formData.step11?.heroMediaUrls || [],
            summary_headline: formData.step11?.summaryHeadline || null,
            timeline_headline: formData.step11?.timelineHeadline || null,
            evidence_headline: formData.step11?.evidenceHeadline || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', caseId);

        if (caseUpdateError) throw caseUpdateError;

        setToast({ message: 'Case updated successfully!', type: 'success' });
        setTimeout(() => navigate('/admin/plaintiffs'), 1500);
        return;
      }

      // CREATE new case
      // Assign plaintiff role to user in their profile
      const { error: roleUpdateError } = await supabase
        .from('user_profiles')
        .update({ role: 'plaintiff' })
        .eq('id', user.id);

      if (roleUpdateError) {
        console.warn('Role assignment warning:', roleUpdateError);
      }

      const { error: submissionError } = await supabase
        .from('pending_case_submissions')
        .insert({
          submitted_by: user.id,
          defendant_full_name: formData.step1.defendantFullName,
          defendant_email: formData.step1.defendantEmail || null,
          defendant_phone: formData.step1.defendantPhone || null,
          defendant_address: formData.step1.defendantLocation || null,
          case_data: formData,
          submission_date: new Date().toISOString(),
          is_processed: false,
        });

      if (submissionError) throw submissionError;

      // REMOVED - Old approach tried to insert directly into multiple tables
      // Now all data is stored in pending_case_submissions for admin review
      /*
      await supabase.from('case_defendants').insert({
        case_id: caseData.id,
        first_name: formData.step1.defendantFirstName,
        middle_name: formData.step1.defendantMiddleName,
        last_name: formData.step1.defendantLastName,
        full_name: formData.step1.defendantFullName,
        aliases: formData.step1.defendantAliases,
        current_location: formData.step1.defendantLocation,
        age: formData.step1.defendantAge ? parseInt(formData.step1.defendantAge) : null,
        photo_url: formData.step1.defendantPhoto,
        business_names: formData.step1.businessNames,
        websites: formData.step1.websites,
        known_associates: formData.step1.knownAssociates,
      });

      await supabase.from('case_relationship_details').insert({
        case_id: caseData.id,
        relationship_type: formData.step2.relationshipType,
        how_met: formData.step2.howMet,
        relationship_start_date: formData.step2.relationshipStartDate || null,
        relationship_end_date: formData.step2.relationshipEndDate || null,
        introduced_by: formData.step2.introducedBy,
        initial_trust_factors: formData.step2.initialTrustFactors,
        early_warning_signs: formData.step2.earlyWarningSigns,
      });

      await supabase.from('case_financial_impact').insert({
        case_id: caseData.id,
        submitted_by: user.id,
        total_amount_lost: formData.step5.totalLost,
        direct_payments: formData.step5.directPayments,
        lost_wages: formData.step5.lostWages,
        property_assets_lost: formData.step5.propertyLost,
        legal_fees: formData.step5.legalFees,
        medical_therapy_costs: formData.step5.medicalCosts,
        credit_damage_amount: formData.step5.creditDamage,
        other_financial_harm: formData.step5.otherFinancial,
        other_financial_description: formData.step5.otherDescription,
        recovery_attempts: formData.step5.recoveryAttempts,
        current_status: formData.step5.currentStatus,
        amount_recovered: formData.step5.amountRecovered,
      });

      // Insert personal impact data (Step 6)
      if (formData.step6) {
        await supabase.from('case_personal_impact').insert({
          case_id: caseData.id,
          submitted_by: user.id,
          has_emotional_harm: formData.step6.hasEmotionalHarm,
          emotional_description: formData.step6.emotionalDescription,
          therapy_required: formData.step6.therapyRequired,
          has_ptsd_symptoms: formData.step6.hasPTSD,
          has_depression: formData.step6.hasDepression,
          has_anxiety: formData.step6.hasAnxiety,
          suicide_ideation: formData.step6.suicideIdeation,
          trust_issues: formData.step6.trustIssues,
          has_physical_harm: formData.step6.hasPhysicalHarm,
          physical_injuries: formData.step6.physicalInjuries,
          medical_treatment_required: formData.step6.medicalTreatment,
          ongoing_health_issues: formData.step6.ongoingHealth,
          has_career_impact: formData.step6.hasCareerImpact,
          career_damage_description: formData.step6.careerDamage,
          lost_opportunities: formData.step6.lostOpportunities,
          reputation_harm: formData.step6.reputationHarm,
          has_relationship_impact: formData.step6.hasRelationshipImpact,
          relationship_breakdown: formData.step6.relationshipBreakdown,
          family_members_affected: formData.step6.familyAffected,
          children_affected: formData.step6.childrenAffected,
          has_ongoing_consequences: formData.step6.hasOngoingConsequences,
          current_safety_concerns: formData.step6.safetyConcerns,
          financial_instability: formData.step6.financialInstability,
          ongoing_legal_battles: formData.step6.ongoingLegal,
        });
      }

      await supabase.from('case_members').insert({
        case_id: caseData.id,
        user_id: user.id,
        role: 'plaintiff',
        permissions: ['view', 'edit', 'submit_evidence'],
      });

      if (formData.step7?.timelineEvents && formData.step7.timelineEvents.length > 0) {
        const timelineInserts = formData.step7.timelineEvents.map((event, index) => ({
          case_id: caseData.id,
          year: event.date || new Date().getFullYear().toString(),
          country: event.country || '',
          city: event.city || '',
          latitude: event.latitude ? parseFloat(event.latitude) : null,
          longitude: event.longitude ? parseFloat(event.longitude) : null,
          event_type: event.eventType || 'key_event',
          event_description: event.description || '',
          verification_status: 'pending',
          sort_order: index,
        }));

        await supabase.from('timeline_events').insert(timelineInserts);
      }

      if (formData.step8?.evidenceItems && formData.step8.evidenceItems.length > 0) {
        const evidenceInserts = formData.step8.evidenceItems.map((item) => ({
          case_id: caseData.id,
          evidence_id: `EV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title || 'Untitled Evidence',
          description: item.description || '',
          category: item.category || item.type || 'document',
          file_url: item.files[0] || null,
          verification_status: 'pending',
        }));

        await supabase.from('evidence').insert(evidenceInserts);
      }

      // Insert witnesses and other victims (Step 9)
      if (formData.step9) {
        const witnessInserts = [];

        if (formData.step9.otherVictims && formData.step9.otherVictims.length > 0) {
          formData.step9.otherVictims.forEach((victim) => {
            if (victim.name || victim.contactInfo) {
              witnessInserts.push({
                case_id: caseData.id,
                witness_type: 'other_victim',
                full_name: victim.name,
                contact_info: victim.contactInfo,
                relationship_to_case: victim.howKnown,
                similar_patterns: victim.similarPatterns,
                willing_to_come_forward: victim.willingToComeForth,
              });
            }
          });
        }

        if (formData.step9.witnesses && formData.step9.witnesses.length > 0) {
          formData.step9.witnesses.forEach((witness) => {
            if (witness.name) {
              witnessInserts.push({
                case_id: caseData.id,
                witness_type: 'eyewitness',
                full_name: witness.name,
                contact_info: witness.contactInfo,
                relationship_to_case: witness.relationshipToCase,
                what_they_witnessed: witness.whatWitnessed,
                has_provided_statement: witness.hasStatement,
                statement_url: witness.statementUrl,
              });
            }
          });
        }

        if (witnessInserts.length > 0) {
          await supabase.from('case_witnesses').insert(witnessInserts);
        }
      }

      // Insert legal actions (Step 10)
      if (formData.step10?.legalActions && formData.step10.legalActions.length > 0) {
        const legalActionInserts = formData.step10.legalActions.map((action) => ({
          case_id: caseData.id,
          action_type: action.actionType,
          filed_date: action.filedDate || null,
          jurisdiction: action.jurisdiction,
          case_number: action.caseNumber,
          status: action.status,
          outcome: action.outcome,
          amount_awarded: action.amountAwarded || 0,
          is_collectible: action.isCollectible,
          document_urls: action.documents,
          description: action.description,
        }));

        await supabase.from('case_legal_actions').insert(legalActionInserts);
      }
      */

      // Delete the saved draft after successful submission
      await supabase
        .from('case_form_progress')
        .delete()
        .eq('user_id', user.id)
        .is('case_id', null);

      alert('Case submitted successfully! Our team will review it and contact you soon.');
      navigate('/');
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(`Failed to submit case: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">{isEditMode ? 'Loading case...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.step1.caseTypes &&
          formData.step1.caseTypes.length > 0 &&
          formData.step1.defendantFirstName &&
          formData.step1.defendantMiddleName &&
          formData.step1.defendantLastName &&
          formData.step1.dateRange
        );
      case 2:
        return formData.step2.relationshipType && formData.step2.howMet && formData.step2.initialTrustFactors;
      case 3:
        return formData.step3.promiseMade;
      case 11:
        return formData.step11.oneSentenceSummary && formData.step11.detailedNarrative;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full mb-4">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Plaintiff Case Submission</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
          {isEditMode ? 'Edit Case' : 'Create New Case'}
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          {isEditMode
            ? 'Update case details and evidence. Changes are saved when you submit.'
            : 'Build your case systematically. We\'ll guide you through every step. Your progress is automatically saved.'}
        </p>
      </div>

      {showDraftBanner && hasSavedDraft && (
        <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Saved Draft Found</h3>
              <p className="text-slate-300 mb-4">
                You have a saved draft from a previous session. Would you like to continue where you left off?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={resumeDraft}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                >
                  Resume Draft
                </button>
                <button
                  onClick={startFresh}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FormWizard
        steps={FORM_STEPS}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onSave={saveProgress}
        onLoad={loadLastSavedData}
        saving={saving}
        loading={loadingDraft}
      >
        <div className="space-y-6">
          {currentStep === 1 && (
            <Step1DefendantInfo
              data={formData.step1}
              onChange={(data) => setFormData({ ...formData, step1: data })}
            />
          )}
          {currentStep === 2 && (
            <Step2Relationship
              data={formData.step2}
              onChange={(data) => setFormData({ ...formData, step2: data })}
            />
          )}
          {currentStep === 3 && (
            <Step3Promise
              data={formData.step3}
              onChange={(data) => setFormData({ ...formData, step3: data })}
            />
          )}
          {currentStep === 4 && (
            <Step4Betrayal
              data={formData.step4}
              onChange={(data) => setFormData({ ...formData, step4: data })}
            />
          )}
          {currentStep === 5 && (
            <Step5FinancialImpact
              data={formData.step5}
              onChange={(data) => setFormData({ ...formData, step5: data })}
            />
          )}
          {currentStep === 6 && (
            <Step6PersonalImpact
              data={formData.step6}
              onChange={(data) => setFormData({ ...formData, step6: data })}
            />
          )}
          {currentStep === 7 && (
            <Step7Timeline
              data={formData.step7}
              onChange={(data) => setFormData({ ...formData, step7: data })}
            />
          )}
          {currentStep === 8 && (
            <Step9OthersAffected
              data={formData.step9}
              onChange={(data) => setFormData({ ...formData, step9: data })}
            />
          )}
          {currentStep === 9 && (
            <Step10LegalActions
              data={formData.step10}
              onChange={(data) => setFormData({ ...formData, step10: data })}
            />
          )}
          {currentStep === 10 && (
            <Step11Narrative
              data={formData.step11}
              onChange={(data) => setFormData({ ...formData, step11: data })}
            />
          )}
          {currentStep === 11 && (
            <Step12VisibilitySafety
              data={formData.step12}
              onChange={(data) => setFormData({ ...formData, step12: data })}
            />
          )}
          {currentStep === 12 && (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Ready to Submit
                </h3>
                <p className="text-slate-300 mb-4">
                  You've completed the case form. Review your information and submit for
                  moderation. Our team will review and may contact you for clarification.
                </p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.step13?.agreedToTerms || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          step13: { ...formData.step13, agreedToTerms: e.target.checked },
                        })
                      }
                      className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-blue-600"
                    />
                    <span className="text-sm text-slate-300">
                      I affirm that the information provided is truthful to the best of my
                      knowledge
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.step13?.understandsReview || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          step13: {
                            ...formData.step13,
                            understandsReview: e.target.checked,
                          },
                        })
                      }
                      className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-blue-600"
                    />
                    <span className="text-sm text-slate-300">
                      I understand this case will be reviewed before publication
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <WizardNavigation
          currentStep={currentStep}
          totalSteps={FORM_STEPS.length}
          onPrevious={() => setCurrentStep(Math.max(1, currentStep - 1))}
          onNext={() => setCurrentStep(Math.min(FORM_STEPS.length, currentStep + 1))}
          onSubmit={handleSubmit}
          canProceed={canProceed()}
          isSubmitting={submitting}
        />
      </FormWizard>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
