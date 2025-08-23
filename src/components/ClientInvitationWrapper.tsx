"use client";

import {
  InvitationTemplate,
  InvitationData,
} from "@/components/InvitationTemplate";
import { useAuth } from "@/contexts/AuthContext";

interface ClientInvitationWrapperProps {
  data: InvitationData;
  themeName: string;
  ownerId?: string;
}

export default function ClientInvitationWrapper({
  data,
  themeName,
  ownerId,
}: ClientInvitationWrapperProps) {
  const { user } = useAuth();
  const isOwner = user && ownerId && user.id === ownerId;

  return (
    <InvitationTemplate data={data} themeName={themeName} isOwner={!!isOwner} />
  );
}
