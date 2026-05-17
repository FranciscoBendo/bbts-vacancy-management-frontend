export type UserRole = 'REQUESTER' | 'RH';
export interface User { id: string; name: string; role: UserRole; }
export type VacancyStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type VacancyPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface Vacancy { id: string; title: string; description: string; location: string; priority: VacancyPriority; status: VacancyStatus; createdAt: string; requesterId: string; requirements: Requirement[]; }
export type RequirementType = 'SKILL' | 'LANGUAGE' | 'CERTIFICATION' | 'EDUCATION' | 'COMPANY' | 'LOCATION';
export interface Requirement { id: string; vacancyId: string; type: RequirementType; name: string; weight: number; mandatory: boolean; }
export interface ApprovalDecision { vacancyId: string; decision: 'APPROVED' | 'REJECTED'; justification?: string; decidedAt: string; }
export interface CandidateExplanation { metRequirements: number; totalRequirements: number; missingMandatory: string[]; strengths: string[]; locationMatch: boolean;}
export interface CandidateMatch { candidateId: string; fullName: string; headline: string; location: string; score: number; explanation: CandidateExplanation; }
export interface CandidateSkill { id: string; name: string; level?: string; yearsExperience?: number; }
export interface CandidateExperience { id: string; company: string; role: string; startYear?: number; endYear?: number; current: boolean; }
export interface CandidateEducation { id: string; institution: string; course: string; degree?: string; graduationYear?: number; }
export interface CandidateLanguage { id: string; name: string; level?: string; }
export interface CandidateCertification { id: string; name: string; issuer?: string; year?: number; }
export interface CandidateDetail { id: string; fullName: string; headline: string; email?: string; location: string; linkedinUrl?: string; createdAt: string; skills: CandidateSkill[]; experiences: CandidateExperience[]; educations: CandidateEducation[]; languages: CandidateLanguage[]; certifications: CandidateCertification[]; }
export type IntegrationStatus = 'SUCCESS' | 'PARTIAL' | 'FAILED';
export interface IntegrationLog { id: string; source: string; filename?: string; status: IntegrationStatus; totalRecords: number; successCount: number; errorCount: number; errorsJson?: Array<{ row: number; message: string }>; }

export interface CandidateListItem {
  id: string;
  fullName: string;
  headline: string;
  location: string;
  email?: string;
  skillsSummary: string[];
  createdAt: string;
}
