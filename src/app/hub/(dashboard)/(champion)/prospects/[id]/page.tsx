import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProspectDetailRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/hub/pipeline?prospect=${id}`);
}
