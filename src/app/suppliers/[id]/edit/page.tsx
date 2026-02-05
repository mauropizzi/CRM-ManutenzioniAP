import { SupplierProvider } from "@/context/supplier-context";
import EditSupplierClient from "./edit-supplier-client";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <SupplierProvider>
          <EditSupplierClient supplierId={id} />
        </SupplierProvider>
      </div>
    </div>
  );
}