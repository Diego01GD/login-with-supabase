import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FeedbackPageClient, {
  type FeedbackRatingSummary,
  type FeedbackReviewItem,
} from "@/components/feedback-page-client";

type ReviewRow = {
  id: string;
  exchange_id: string;
  reviewer_id: string;
  reviewee_id: string;
  skill_id: string | null;
  general_rating: number;
  mastery_rating: number;
  clarity_rating: number;
  punctuality_rating: number;
  attitude_rating: number;
  respect_rating: number;
  comment: string | null;
  created_at: string;
};

type SimpleProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type SimpleSkill = {
  id: string;
  name: string;
};

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toReviewItems(
  reviews: ReviewRow[],
  profileMap: Map<string, SimpleProfile>,
  skillMap: Map<string, SimpleSkill>,
): FeedbackReviewItem[] {
  return reviews.map((review) => {
    const author = profileMap.get(review.reviewer_id);
    const skill = review.skill_id ? skillMap.get(review.skill_id) : undefined;

    return {
      id: review.id,
      exchangeId: review.exchange_id,
      authorId: review.reviewer_id,
      targetId: review.reviewee_id,
      authorName: author?.full_name || "Usuario",
      authorAvatar: author?.avatar_url || "",
      skillName: skill?.name || "Habilidad no especificada",
      comment: review.comment || "Sin comentario",
      createdAt: review.created_at,
      ratings: {
        overall: review.general_rating,
        mastery: review.mastery_rating,
        clarity: review.clarity_rating,
        punctuality: review.punctuality_rating,
        attitude: review.attitude_rating,
        respect: review.respect_rating,
      },
    };
  });
}

export default async function FeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    { data: profile },
    { count: unreadMessagesTotal },
    { count: pendingExchanges },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .neq("sender_id", user.id)
      .eq("is_read", false),
    supabase
      .from("skill_exchanges")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("status", "pending"),
  ]);

  const [receivedRes, authoredRes] = await Promise.all([
    supabase
      .from("exchange_reviews")
      .select(
        "id, exchange_id, reviewer_id, reviewee_id, skill_id, general_rating, mastery_rating, clarity_rating, punctuality_rating, attitude_rating, respect_rating, comment, created_at",
      )
      .eq("reviewee_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("exchange_reviews")
      .select(
        "id, exchange_id, reviewer_id, reviewee_id, skill_id, general_rating, mastery_rating, clarity_rating, punctuality_rating, attitude_rating, respect_rating, comment, created_at",
      )
      .eq("reviewer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const receivedRows = (receivedRes.data || []) as ReviewRow[];
  const authoredRows = (authoredRes.data || []) as ReviewRow[];

  const participantIds = Array.from(
    new Set(
      [
        ...receivedRows.map((row) => row.reviewer_id),
        ...authoredRows.map((row) => row.reviewer_id),
      ].filter(Boolean),
    ),
  );

  const skillIds = Array.from(
    new Set(
      [...receivedRows, ...authoredRows]
        .map((row) => row.skill_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const [{ data: participantProfiles }, { data: skills }] = await Promise.all([
    participantIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", participantIds)
      : Promise.resolve({ data: [] as SimpleProfile[] }),
    skillIds.length
      ? supabase.from("skills").select("id, name").in("id", skillIds)
      : Promise.resolve({ data: [] as SimpleSkill[] }),
  ]);

  const profileMap = new Map(
    ((participantProfiles || []) as SimpleProfile[]).map((p) => [p.id, p]),
  );
  const skillMap = new Map(
    ((skills || []) as SimpleSkill[]).map((s) => [s.id, s]),
  );

  const receivedReviews = toReviewItems(receivedRows, profileMap, skillMap);
  const authoredReviews = toReviewItems(authoredRows, profileMap, skillMap);

  const summary: FeedbackRatingSummary = {
    totalReviews: receivedRows.length,
    overall: average(receivedRows.map((r) => r.general_rating)),
    mastery: average(receivedRows.map((r) => r.mastery_rating)),
    clarity: average(receivedRows.map((r) => r.clarity_rating)),
    punctuality: average(receivedRows.map((r) => r.punctuality_rating)),
    attitude: average(receivedRows.map((r) => r.attitude_rating)),
    respect: average(receivedRows.map((r) => r.respect_rating)),
  };

  return (
    <FeedbackPageClient
      userName={profile?.full_name || "Usuario"}
      avatarUrl={profile?.avatar_url || ""}
      initialUnreadCount={unreadMessagesTotal || 0}
      initialPendingExchanges={pendingExchanges || 0}
      summary={summary}
      receivedReviews={receivedReviews}
      authoredReviews={authoredReviews}
    />
  );
}
