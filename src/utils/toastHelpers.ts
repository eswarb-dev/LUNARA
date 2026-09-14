
import { toast } from '@/hooks/use-toast';

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    className: "font-garamond",
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
    className: "font-garamond",
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    className: "font-garamond",
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    className: "font-garamond border-moon-gold/35",
  });
};
