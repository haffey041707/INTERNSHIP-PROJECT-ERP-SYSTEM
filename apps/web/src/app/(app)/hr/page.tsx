import { ERPModulePage } from '@/components/ERPModulePage';

export default function HrPage() {
  return (
    <ERPModulePage
      eyebrow="People operations"
      title="HR & Payroll"
      moduleSlug="hr"
      description="Run staff records, attendance, leave, contracts, payroll preparation, and compliance workflows from one place."
      stats={[
        { label: 'Staff', value: '86' },
        { label: 'Leave requests', value: '9' },
        { label: 'Payroll batches', value: '2' },
        { label: 'Compliance', value: '96%' },
      ]}
      sections={[
        { title: 'Staff Lifecycle', items: ['Employee profiles', 'Contracts', 'Onboarding tasks', 'Exit process'] },
        { title: 'Time & Leave', items: ['Staff attendance', 'Leave approvals', 'Duty rosters', 'Overtime tracking'] },
        { title: 'Payroll Controls', items: ['Salary components', 'Deductions', 'Payroll review', 'Payslip archive'] },
      ]}
    />
  );
}
