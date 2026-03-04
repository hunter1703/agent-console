import { redirect } from "next/navigation";

export default function AgentPageRedirect({
    params,
}: {
    params: { id: string };
}) {
    redirect(`/chat/${params.id}`);
}
