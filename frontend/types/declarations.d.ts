declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  export type Icon = FC<IconProps>;
  
  export const Send: Icon;
  export const Bot: Icon;
  export const User: Icon;
  export const FileText: Icon;
  export const Sparkles: Icon;
  export const Upload: Icon;
  export const CheckCircle: Icon;
  export const AlertCircle: Icon;
  export const X: Icon;
  export const File: Icon;
  export const Lock: Icon;
  export const Mail: Icon;
  export const Loader2: Icon;
  export const ArrowRight: Icon;
  export const Database: Icon;
  export const Search: Icon;
  export const Zap: Icon;
  export const MessageSquare: Icon;
  export const Plus: Icon;
  export const Trash2: Icon;
  export const LogOut: Icon;
  export const Menu: Icon;
  export const Globe: Icon;
  export const Link: Icon;
  export const Settings: Icon;
  // Add other icons as needed
}
