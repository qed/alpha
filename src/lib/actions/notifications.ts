"use server";

import { Resend } from "resend";
import { getChampionForGeography } from "./champions";
import { NewProspectEmail } from "@/components/emails/new-prospect-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notifyNewProspect(data: {
  geographyId: string;
  geographyName: string;
  parentFirstName: string;
  childCount: number;
}): Promise<void> {
  try {
    const recipient = await getChampionForGeography(data.geographyId);
    if (!recipient) return;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://enroll.alphaschool.com";
    const prospectsUrl = `${baseUrl}/hub/prospects`;

    await resend.emails.send({
      from: "Alpha Enrollment <enrollment@alphaschool.com>",
      to: recipient.email,
      subject: `New interest in Alpha School ${data.geographyName}`,
      react: NewProspectEmail({
        championName: recipient.name,
        parentFirstName: data.parentFirstName,
        childCount: data.childCount,
        geographyName: data.geographyName,
        prospectsUrl,
      }),
    });
  } catch (err) {
    console.error("Failed to send new prospect notification:", err);
  }
}
