export interface IAdminUsersTranslations {
  title: string;
  addTeacherButton: string;
  teacherRequestsButton: string;
  searchPlaceholder: string;
  fields: {
    name: string;
    email: string;
    phone: string;
    password: string;
    specialization: string;
    experience: string;
    bio: string;
    category: string;
    googleDriveLink: string;
  };
  placeholders: {
    name: string;
    email: string;
    phone: string;
    password: string;
    specialization: string;
    experience: string;
    bio: string;
    googleDriveLink: string;
    search: string;
  };
  validation: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    phoneInvalid: string;
    passwordRequired: string;
    passwordMin: string;
    categoryRequired: string;
    googleDriveLinkRequired: string;
  };
  messages: {
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    deleteConfirm: string;
    deleteConfirmTitle: string;
    blockSuccess: string;
    unblockSuccess: string;
    blockError: string;
    loadError: string;
    saveError: string;
    deleteError: string;
    requestApproved: string;
    requestRejected: string;
    requestProcessError: string;
    grantAccessSuccess: string;
    grantAccessError: string;
    revokeAccessSuccess: string;
    revokeAccessError: string;
    noAccesses: string;
  };
  table: {
    user: string;
    role: string;
    status: string;
    registrationDate: string;
    actions: string;
    view: string;
    edit: string;
    block: string;
    unblock: string;
    delete: string;
    grantAccess: string;
    revokeAccess: string;
    openMaterials: string;
    grantedDate: string;
  };
  roles: {
    admin: string;
    teacher: string;
    student: string;
  };
  statuses: {
    active: string;
    blocked: string;
  };
  requestStatuses: {
    pending: string;
    approved: string;
    rejected: string;
  };
  modals: {
    viewTitle: string;
    createTitle: string;
    editTitle: string;
    grantAccessTitle: string;
    requestsTitle: string;
    close: string;
    cancel: string;
    save: string;
    create: string;
    approve: string;
    reject: string;
  };
  requestColumns: {
    teacher: string;
    specialization: string;
    experience: string;
    status: string;
    actions: string;
  };
}

export const adminUsers: IAdminUsersTranslations = {
  title: "User Management",
  addTeacherButton: "Add Teacher",
  teacherRequestsButton: "Teacher Requests",
  searchPlaceholder: "Search by name or email",
  fields: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    password: "Password",
    specialization: "Specialization",
    experience: "Experience",
    bio: "Bio",
    category: "Category",
    googleDriveLink: "Google Drive Link",
  },
  placeholders: {
    name: "Enter name",
    email: "Enter email",
    phone: "Enter phone",
    password: "Enter password",
    specialization: "Enter specialization",
    experience: "e.g., 5 years",
    bio: "Tell about yourself...",
    googleDriveLink: "https://drive.google.com/...",
    search: "Search...",
  },
  validation: {
    nameRequired: "Please enter name",
    emailRequired: "Please enter email",
    emailInvalid: "Please enter valid email",
    phoneInvalid: "Please enter valid phone number",
    passwordRequired: "Please enter password",
    passwordMin: "Password must be at least 6 characters",
    categoryRequired: "Please select category",
    googleDriveLinkRequired: "Please enter link",
  },
  messages: {
    createSuccess: "Teacher created successfully",
    updateSuccess: "User updated successfully",
    deleteSuccess: "User deleted successfully",
    deleteConfirm: "Are you sure you want to delete this user?",
    deleteConfirmTitle: "Delete User",
    blockSuccess: "User blocked",
    unblockSuccess: "User unblocked",
    blockError: "Error changing status",
    loadError: "Failed to load users",
    saveError: "Failed to save user",
    deleteError: "Failed to delete user",
    requestApproved: "Request approved",
    requestRejected: "Request rejected",
    requestProcessError: "Error processing request",
    grantAccessSuccess: "Access granted successfully",
    grantAccessError: "Error granting access",
    revokeAccessSuccess: "Access revoked",
    revokeAccessError: "Error revoking access",
    noAccesses: "No accesses granted",
  },
  table: {
    user: "User",
    role: "Role",
    status: "Status",
    registrationDate: "Registration Date",
    actions: "Actions",
    view: "View",
    edit: "Edit",
    block: "Block",
    unblock: "Unblock",
    delete: "Delete",
    grantAccess: "Grant Access",
    revokeAccess: "Revoke Access",
    openMaterials: "Open",
    grantedDate: "Granted Date",
  },
  roles: {
    admin: "Administrator",
    teacher: "Teacher",
    student: "Student",
  },
  statuses: {
    active: "Active",
    blocked: "Blocked",
  },
  requestStatuses: {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  },
  modals: {
    viewTitle: "View User",
    createTitle: "Create Teacher",
    editTitle: "Edit User",
    grantAccessTitle: "Grant Access to Materials for: {{name}}",
    requestsTitle: "Teacher Requests",
    close: "Close",
    cancel: "Cancel",
    save: "Save",
    create: "Create",
    approve: "Approve",
    reject: "Reject",
  },
  requestColumns: {
    teacher: "Teacher",
    specialization: "Specialization",
    experience: "Experience",
    status: "Status",
    actions: "Actions",
  },
};