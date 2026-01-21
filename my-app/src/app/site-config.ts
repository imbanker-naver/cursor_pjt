export type ThemeMode = "dark" | "light";

export type SiteConfig = {
  brandName: string;
  title: string;
  subtitle: string;
  links: {
    kakaoOpenChat?: string;
    youtube?: string;
    threads?: string;
    linkedin?: string;
  };
  contact: {
    mode: "mailto";
    mailto: string;
  };
  theme: {
    default: ThemeMode;
    persist: boolean;
    storageKey: string;
  };
};

export const siteConfig: SiteConfig = {
  brandName: "YourBrand",
  title: "My Links",
  subtitle: "Connect with me",
  links: {
    kakaoOpenChat: "https://open.kakao.com/o/example",
    youtube: "https://youtube.com/@yourchannel",
    threads: "https://www.threads.net/@yourhandle",
    linkedin: "https://www.linkedin.com/in/yourprofile",
  },
  contact: {
    mode: "mailto",
    mailto: "you@example.com",
  },
  theme: {
    default: "dark",
    persist: true,
    storageKey: "theme",
  },
};
