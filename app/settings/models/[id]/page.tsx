import SchemaDrivenBuilderPage from "@/components/SchemaDrivenBuilderPage";

export default async function EditModelBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  return <SchemaDrivenBuilderPage assetType="model" assetId={resolved.id} />;
}
