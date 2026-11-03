/** Demo-mode users shown on /users and /admin/users. */
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  clientId: string;
  clientName: string | null;
  projectCount: number;
}

export const getMockUsers = (): User[] => [
  // ===== SUPER ADMIN =====
  {
    id: 'super-admin-1',
    email: 'honored.guest@demo.portfolio',
    name: 'Honored Guest (You)',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    clientId: 'client-demo',
    clientName: 'CRM Portfolio Demo Company',
    projectCount: 3
  },
  {
    id: 'super-admin-2',
    email: 'system.admin@crm.demo',
    name: 'System Administrator',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    clientId: 'client-demo',
    clientName: 'CRM Portfolio Demo Company',
    projectCount: 5
  },
  
  // ===== ADMINS (Full Company Access) =====
  {
    id: 'admin-1',
    email: 'john.smith@techstart.demo',
    name: 'John Smith',
    role: 'ADMIN',
    status: 'ACTIVE',
    clientId: 'client-001',
    clientName: 'TechStart Solutions',
    projectCount: 3
  },
  {
    id: 'admin-2',
    email: 'alexandra.wong@enterprise.demo',
    name: 'Alexandra Wong',
    role: 'ADMIN',
    status: 'ACTIVE',
    clientId: 'client-003',
    clientName: 'Enterprise Systems Inc',
    projectCount: 4
  },
  {
    id: 'admin-3',
    email: 'robert.chen@cloudtech.demo',
    name: 'Robert Chen',
    role: 'ADMIN',
    status: 'ACTIVE',
    clientId: 'client-006',
    clientName: 'CloudTech Partners',
    projectCount: 2
  },
  
  // ===== STAFF (Project Managers & Sales Leads) =====
  {
    id: 'staff-1',
    email: 'sarah.johnson@techstart.demo',
    name: 'Sarah Johnson',
    role: 'STAFF',
    status: 'ACTIVE',
    clientId: 'client-001',
    clientName: 'TechStart Solutions',
    projectCount: 2
  },
  {
    id: 'staff-2',
    email: 'michael.chen@growth.demo',
    name: 'Michael Chen',
    role: 'STAFF',
    status: 'ACTIVE',
    clientId: 'client-002',
    clientName: 'Growth Marketing Co',
    projectCount: 3
  },
  {
    id: 'staff-3',
    email: 'james.wilson@cloudtech.demo',
    name: 'James Wilson',
    role: 'STAFF',
    status: 'ACTIVE',
    clientId: 'client-006',
    clientName: 'CloudTech Partners',
    projectCount: 2
  },
  {
    id: 'staff-4',
    email: 'emily.rodriguez@innovate.demo',
    name: 'Emily Rodriguez',
    role: 'STAFF',
    status: 'ACTIVE',
    clientId: 'client-005',
    clientName: 'Innovate Labs',
    projectCount: 1
  },
  {
    id: 'staff-5',
    email: 'david.park@enterprise.demo',
    name: 'David Park',
    role: 'STAFF',
    status: 'ACTIVE',
    clientId: 'client-003',
    clientName: 'Enterprise Systems Inc',
    projectCount: 4
  },
  
  // ===== USERS (Sales Reps & Team Members) =====
  {
    id: 'user-1',
    email: 'maria.garcia@smartbiz.demo',
    name: 'Maria Garcia',
    role: 'USER',
    status: 'ACTIVE',
    clientId: 'client-007',
    clientName: 'SmartBiz Solutions',
    projectCount: 1
  },
  {
    id: 'user-2',
    email: 'thomas.anderson@matrix.demo',
    name: 'Thomas Anderson',
    role: 'USER',
    status: 'ACTIVE',
    clientId: 'client-008',
    clientName: 'Matrix Technologies',
    projectCount: 1
  },
  {
    id: 'user-3',
    email: 'lisa.wang@digital.demo',
    name: 'Lisa Wang',
    role: 'USER',
    status: 'ACTIVE',
    clientId: 'client-001',
    clientName: 'TechStart Solutions',
    projectCount: 2
  },
  {
    id: 'user-4',
    email: 'kevin.martinez@growth.demo',
    name: 'Kevin Martinez',
    role: 'USER',
    status: 'ACTIVE',
    clientId: 'client-002',
    clientName: 'Growth Marketing Co',
    projectCount: 1
  },
  {
    id: 'user-5',
    email: 'amanda.lee@cloudtech.demo',
    name: 'Amanda Lee',
    role: 'USER',
    status: 'ACTIVE',
    clientId: 'client-006',
    clientName: 'CloudTech Partners',
    projectCount: 1
  },
  {
    id: 'user-6',
    email: 'daniel.kim@enterprise.demo',
    name: 'Daniel Kim',
    role: 'USER',
    status: 'ACTIVE',
    clientId: 'client-003',
    clientName: 'Enterprise Systems Inc',
    projectCount: 2
  },
  
  // ===== PENDING APPROVALS (New Sign-ups) =====
  {
    id: 'pending-1',
    email: 'jennifer.brown@startup.demo',
    name: 'Jennifer Brown',
    role: 'USER',
    status: 'PENDING_APPROVAL',
    clientId: 'client-009',
    clientName: 'Startup Ventures LLC',
    projectCount: 0
  },
  {
    id: 'pending-2',
    email: 'chris.taylor@bizdev.demo',
    name: 'Christopher Taylor',
    role: 'USER',
    status: 'PENDING_APPROVAL',
    clientId: 'client-010',
    clientName: 'BizDev Associates',
    projectCount: 0
  },
  {
    id: 'pending-3',
    email: 'lisa.thompson@smallbiz.demo',
    name: 'Lisa Thompson',
    role: 'USER',
    status: 'PENDING_APPROVAL',
    clientId: 'client-004',
    clientName: 'Small Biz Consulting',
    projectCount: 0
  },
  
  // ===== SUSPENDED/INACTIVE =====
  {
    id: 'suspended-1',
    email: 'former.employee@oldclient.demo',
    name: 'Former Employee',
    role: 'USER',
    status: 'SUSPENDED',
    clientId: 'client-011',
    clientName: 'Legacy Client Corp',
    projectCount: 0
  }
];
