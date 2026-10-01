"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export function useActionToast(state: { status: string; message: string }) {
  const { toast } = useToast();
  useEffect(() => {
    if (state.status !== "green" && state.status !== "error") return;
    toast({
      title: state.status === "green" ? "Success" : "Error",
      description: state.message,
      variant: state.status === "error" ? "destructive" : "default",
    });
  }, [state, toast]);
}
