export interface IProfileTranslations {
  title: string;
  loading: string;
  avatar: {
    upload: string;
    uploading: string;
    success: string;
    error: string;
  };
  info: {
    personal: string;
    email: string;
    role: string;
    balance: string;
    registrationDate: string;
    name: string;
    phone: string;
    city: string;
    about: string;
    notSpecified: string;
    edit: string;
    save: string;
    cancel: string;
  };
  validation: {
    nameRequired: string;
    nameMin: string;
    nameMax: string;
    namePattern: string;
    phoneInvalid: string;
    cityMin: string;
    cityMax: string;
    cityPattern: string;
    bioMin: string;
    bioMax: string;
  };
  password: {
    change: string;
    title: string;
    current: string;
    new: string;
    confirm: string;
    success: string;
    error: string;
    validation: {
      required: string;
      minLength: string;
      hasLetter: string;
      hasDigit: string;
      confirmMatch: string;
    };
  };
  roles: {
    teacher: string;
    student: string;
    admin: string;
  };
}

export const profile: IProfileTranslations = {
  title: "Profile",
  loading: "Loading...",
  avatar: {
    upload: "Upload Photo",
    uploading: "Uploading...",
    success: "Avatar updated successfully",
    error: "Error uploading avatar",
  },
  info: {
    personal: "Personal Information",
    email: "Email",
    role: "Role",
    balance: "Balance",
    registrationDate: "Registration Date",
    name: "Name",
    phone: "Phone",
    city: "City",
    about: "About",
    notSpecified: "Not specified",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
  },
  validation: {
    nameRequired: "Please enter name",
    nameMin: "Name must contain at least 2 characters",
    nameMax: "Name must not exceed 100 characters",
    namePattern: "Name must contain only letters and spaces",
    phoneInvalid: "Please enter a valid phone number (e.g., +375291234567)",
    cityMin: "City name must contain at least 2 characters",
    cityMax: "City name must not exceed 100 characters",
    cityPattern: "City name must contain only letters, spaces and hyphens",
    bioMin: "Bio must contain at least 10 characters",
    bioMax: "Bio must not exceed 500 characters",
  },
  password: {
    change: "Change Password",
    title: "Change Password",
    current: "Current Password",
    new: "New Password",
    confirm: "Confirm Password",
    success: "Password changed successfully",
    error: "Error changing password",
    validation: {
      required: "Please enter password",
      minLength: "Password must be at least 6 characters",
      hasLetter: "Password must contain at least one letter",
      hasDigit: "Password must contain at least one digit",
      confirmMatch: "Passwords do not match",
    },
  },
  roles: {
    teacher: "Teacher",
    student: "Student",
    admin: "Administrator",
  },
};