import { useToastManager } from "@/components/ui/overlay/toast";

export function useToast() {
  const manager = useToastManager();

  return {
    success: (title: string, description?: string) =>
      manager.add({ type: "success", title, description }),
    error: (title: string, description?: string) =>
      manager.add({ type: "error", title, description }),
  };
}
