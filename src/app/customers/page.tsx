"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerTable } from '@/components/customer-table';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from "@/integrations/supabase/client";

export default function CustomersPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <CustomerTable />
      <Toaster />
    </div>
  );
}