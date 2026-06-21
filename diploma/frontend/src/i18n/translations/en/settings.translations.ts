export interface ISettingsTranslations {
  title: string;
  loading: string;
  language: {
    title: string;
    label: string;
    ru: string;
    en: string;
  };
  notifications: {
    title: string;
    label: string;
    enabled: string;
    disabled: string;
  };
  save: string;
  saving: string;
  success: string;
  error: string;
}

export const settings: ISettingsTranslations = {
  title: "Settings",
  loading: "Loading...",
  language: {
    title: "Language",
    label: "Interface Language",
    ru: "Russian",
    en: "English",
  },
  notifications: {
    title: "Notifications",
    label: "Enable Notifications",
    enabled: "On",
    disabled: "Off",
  },
  save: "Save Settings",
  saving: "Saving...",
  success: "Settings saved",
  error: "Error saving settings",
};