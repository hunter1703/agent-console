import SchemaDrivenBuilderPage from "@/components/SchemaDrivenBuilderPage";

export default async function EditAgentBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  return <SchemaDrivenBuilderPage assetType="agent" assetId={resolved.id} />;
}
