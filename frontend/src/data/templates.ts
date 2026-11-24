import type { CredentialTemplate } from '@/types'

export const TEMPLATES: CredentialTemplate[] = [
  {
    id: 'tpl_identity',
    name: 'Identity credential',
    type: 'IdentityCredential',
    description: 'Records core identity attributes held by the issuing organization.',
    fields: [
      { key: 'fullName', label: 'Full name', required: true },
      { key: 'dateOfBirth', label: 'Date of birth', required: true, input: 'date' },
      {
        key: 'documentType',
        label: 'Document type',
        required: true,
        input: 'select',
        options: ['Internal record', 'Residence card reference', 'Passport reference'],
      },
      {
        key: 'documentReference',
        label: 'Document reference',
        required: true,
        hint: 'Use an internal reference. Do not enter a government ID number.',
      },
      { key: 'residency', label: 'Residency', required: true },
    ],
  },
  {
    id: 'tpl_education',
    name: 'Education credential',
    type: 'EducationCredential',
    description: 'Records a qualification awarded by an education provider.',
    fields: [
      { key: 'institution', label: 'Institution', required: true },
      { key: 'qualification', label: 'Qualification', required: true },
      { key: 'fieldOfStudy', label: 'Field of study', required: true },
      { key: 'yearAwarded', label: 'Year awarded', required: true },
      { key: 'grade', label: 'Grade', required: false, hint: 'Optional.' },
    ],
  },
  {
    id: 'tpl_employment',
    name: 'Employment credential',
    type: 'EmploymentCredential',
    description: 'Records an employment relationship held by the issuer.',
    fields: [
      { key: 'employer', label: 'Employer', required: true },
      { key: 'jobTitle', label: 'Job title', required: true },
      {
        key: 'employmentType',
        label: 'Employment type',
        required: true,
        input: 'select',
        options: ['Full-time', 'Part-time', 'Contract'],
      },
      { key: 'startDate', label: 'Start date', required: true, input: 'date' },
      { key: 'endDate', label: 'End date', required: false, input: 'date', hint: 'Leave empty if current.' },
    ],
  },
]

export function templateById(id: string) {
  return TEMPLATES.find((template) => template.id === id)
}
