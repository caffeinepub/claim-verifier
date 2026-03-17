import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Claim,
  Evidence,
  PrivacySettings,
  Reply,
  ReputationEvent,
  SourceComment,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Session ──────────────────────────────────────────────────────────────────

const SESSION_KEY = "claim_verifier_session_id";
const USERNAME_KEY = "claim_verifier_username";

export function getOrInitSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function saveSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id);
}

function generateUsername(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getOrInitUsername(): string {
  const existing = localStorage.getItem(USERNAME_KEY);
  if (existing) return existing;
  const username = generateUsername();
  localStorage.setItem(USERNAME_KEY, username);
  return username;
}

export function useUsername(): string {
  return getOrInitUsername();
}

export function useSessionId() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["sessionId"],
    queryFn: async () => {
      const existing = localStorage.getItem(SESSION_KEY);
      if (existing) {
        getOrInitUsername();
        if (!localStorage.getItem("rebunked_session_created_at")) {
          localStorage.setItem(
            "rebunked_session_created_at",
            new Date().toISOString(),
          );
        }
        return existing;
      }
      if (!actor) throw new Error("No actor");
      const id = await actor.generateSessionId();
      localStorage.setItem(SESSION_KEY, id);
      localStorage.setItem(
        "rebunked_session_created_at",
        new Date().toISOString(),
      );
      getOrInitUsername();
      return id;
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

// ── OG Image Helper ───────────────────────────────────────────────────────────

async function fetchOgImageFromUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const html = await response.text();
    const match =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ) ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      );
    return match?.[1] ?? "";
  } catch {
    return "";
  }
}

// ── Claims ────────────────────────────────────────────────────────────────────

export function useAllClaims() {
  const { actor, isFetching } = useActor();
  return useQuery<Claim[]>({
    queryKey: ["claims", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClaims();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Claim[]>({
    queryKey: ["claims", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "All") return actor.getAllClaims();
      return actor.getClaimsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Claim>({
    queryKey: ["claim", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getClaimById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      category,
      sessionId,
      authorUsername,
      imageUrls = [],
      urls = [],
    }: {
      title: string;
      description: string;
      category: string;
      sessionId: string;
      authorUsername: string;
      imageUrls?: string[];
      urls?: string[];
    }) => {
      if (!actor) throw new Error("No actor");

      let ogThumbnailUrl = "";
      if (imageUrls.length === 0 && urls.length > 0 && urls[0]) {
        ogThumbnailUrl = await fetchOgImageFromUrl(urls[0]);
      }

      const result = await actor.createClaim(
        title,
        description,
        category,
        sessionId,
        authorUsername,
        imageUrls,
        urls,
        ogThumbnailUrl,
      );
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
  });
}

// ── Votes ─────────────────────────────────────────────────────────────────────

export function useVoteTally(claimId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{
    trueCount: bigint;
    falseCount: bigint;
    unverifiedCount: bigint;
  }>({
    queryKey: ["tally", claimId?.toString()],
    queryFn: async () => {
      if (!actor || claimId === null) throw new Error("No actor or id");
      return actor.getVoteTally(claimId);
    },
    enabled: !!actor && !isFetching && claimId !== null,
  });
}

export function useEnhancedVoteTally(claimId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{
    trueFromEvidence: bigint;
    unverifiedFromEvidence: bigint;
    falseDirect: bigint;
    trueCount: bigint;
    unverifiedDirect: bigint;
    falseFromEvidence: bigint;
    trueDirect: bigint;
    falseCount: bigint;
    unverifiedCount: bigint;
  }>({
    queryKey: ["enhanced-tally", claimId?.toString()],
    queryFn: async () => {
      if (!actor || claimId === null) throw new Error("No actor or id");
      return actor.getEnhancedVoteTally(claimId);
    },
    enabled: !!actor && !isFetching && claimId !== null,
  });
}

export function useSessionVote(
  claimId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["vote", claimId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || claimId === null || !sessionId) return null;
      return actor.getSessionVoteForClaim(claimId, sessionId);
    },
    enabled: !!actor && !isFetching && claimId !== null && !!sessionId,
  });
}

export function useSubmitVote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      sessionId,
      verdict,
    }: {
      claimId: bigint;
      sessionId: string;
      verdict: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitVote(claimId, sessionId, verdict);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tally", variables.claimId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["enhanced-tally", variables.claimId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["vote", variables.claimId.toString()],
      });
    },
  });
}

// ── Evidence ──────────────────────────────────────────────────────────────────

export function useEvidenceForClaim(claimId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Evidence[]>({
    queryKey: ["evidence", claimId?.toString()],
    queryFn: async () => {
      if (!actor || claimId === null) return [];
      return actor.getEvidenceForClaim(claimId);
    },
    enabled: !!actor && !isFetching && claimId !== null,
  });
}

export function useSubmitEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      sessionId,
      authorUsername,
      text,
      imageUrls = [],
      urls = [],
      evidenceType,
    }: {
      claimId: bigint;
      sessionId: string;
      authorUsername: string;
      text: string;
      imageUrls?: string[];
      urls?: string[];
      evidenceType: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.submitEvidence(
        claimId,
        sessionId,
        authorUsername,
        text,
        imageUrls,
        urls,
        evidenceType,
      );
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evidence", variables.claimId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["enhanced-tally", variables.claimId.toString()],
      });
    },
  });
}

export function useEvidenceVoteTally(evidenceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{ netScore: bigint }>({
    queryKey: ["evidence-tally", evidenceId?.toString()],
    queryFn: async () => {
      if (!actor || evidenceId === null) throw new Error("No actor or id");
      return actor.getEvidenceVoteTally(evidenceId);
    },
    enabled: !!actor && !isFetching && evidenceId !== null,
  });
}

export function useSessionVoteForEvidence(
  evidenceId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["evidence-vote", evidenceId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || evidenceId === null || !sessionId) return null;
      return actor.getSessionVoteForEvidence(evidenceId, sessionId);
    },
    enabled: !!actor && !isFetching && evidenceId !== null && !!sessionId,
  });
}

export function useAllEvidenceTallies(evidenceIds: bigint[]) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, number>>({
    queryKey: ["evidence-tallies-bulk", evidenceIds.map((id) => id.toString())],
    queryFn: async () => {
      if (!actor) return {};
      const entries = await Promise.all(
        evidenceIds.map(async (id) => {
          const tally = await actor.getEvidenceVoteTally(id);
          return [id.toString(), Number(tally.netScore)] as [string, number];
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: !!actor && !isFetching && evidenceIds.length > 0,
    staleTime: 10_000,
  });
}

export function useVoteEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      evidenceId,
      sessionId,
      direction,
      claimId: _claimId,
    }: {
      evidenceId: bigint;
      sessionId: string;
      direction: string;
      claimId?: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.voteEvidence(evidenceId, sessionId, direction);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evidence-tally", variables.evidenceId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["evidence-vote", variables.evidenceId.toString()],
      });
      if (variables.claimId != null) {
        queryClient.invalidateQueries({
          queryKey: ["enhanced-tally", variables.claimId.toString()],
        });
      }
    },
  });
}

// ── Reporting ─────────────────────────────────────────────────────────────────

export function useReportContent() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      targetId,
      targetType,
      sessionId,
    }: {
      targetId: bigint;
      targetType: string;
      sessionId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.reportContent(targetId, targetType, sessionId);
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
  });
}

// ── Replies ───────────────────────────────────────────────────────────────────

export type { Reply };

export function useReplies(evidenceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Reply[]>({
    queryKey: ["replies", evidenceId?.toString()],
    queryFn: async () => {
      if (!actor || evidenceId === null) return [];
      return actor.getReplies(evidenceId);
    },
    enabled: !!actor && !isFetching && evidenceId !== null,
  });
}

export function useAddReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      evidenceId,
      parentReplyId,
      text,
      authorUsername,
      sessionId,
    }: {
      evidenceId: bigint;
      parentReplyId: bigint;
      text: string;
      authorUsername: string;
      sessionId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.addReply(
        evidenceId,
        parentReplyId,
        text,
        authorUsername,
        sessionId,
      );
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["replies", variables.evidenceId.toString()],
      });
    },
  });
}

export function useVoteReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      replyId,
      sessionId,
      direction,
    }: {
      replyId: bigint;
      sessionId: string;
      direction: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.voteReply(replyId, sessionId, direction);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reply-tally", variables.replyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["reply-vote", variables.replyId.toString()],
      });
    },
  });
}

export function useReplyVoteTally(replyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{ netScore: bigint }>({
    queryKey: ["reply-tally", replyId?.toString()],
    queryFn: async () => {
      if (!actor || replyId === null) throw new Error("No actor or id");
      return actor.getReplyVoteTally(replyId);
    },
    enabled: !!actor && !isFetching && replyId !== null,
  });
}

export function useSessionVoteForReply(
  replyId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["reply-vote", replyId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || replyId === null || !sessionId) return null;
      return actor.getSessionVoteForReply(replyId, sessionId);
    },
    enabled: !!actor && !isFetching && replyId !== null && !!sessionId,
  });
}

export function useReportReply() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      replyId,
      sessionId,
    }: {
      replyId: bigint;
      sessionId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.reportReply(replyId, sessionId);
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
  });
}

export function useGetHiddenReplies(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Reply[]>({
    queryKey: ["admin", "hidden-replies", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.getHiddenReplies(password);
    },
    enabled: !!actor && !isFetching && !!password,
    retry: false,
  });
}

export function useRestoreReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password }: { id: bigint; password: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.restoreReply(id, password);
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-replies", variables.password],
      });
    },
  });
}

export function useAdminDeleteReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password }: { id: bigint; password: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminDeleteReply(id, password);
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-replies", variables.password],
      });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useGetHiddenClaims(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Claim[]>({
    queryKey: ["admin", "hidden-claims", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return (actor as any).getHiddenClaims(password);
    },
    enabled: !!actor && !isFetching && !!password,
    retry: false,
  });
}

export function useGetHiddenEvidence(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Evidence[]>({
    queryKey: ["admin", "hidden-evidence", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return (actor as any).getHiddenEvidence(password);
    },
    enabled: !!actor && !isFetching && !!password,
    retry: false,
  });
}

export function useRestoreClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password }: { id: bigint; password: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).restoreClaim(id, password);
      if (result && "err" in result) throw new Error(result.err as string);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-claims", variables.password],
      });
    },
  });
}

export function useRestoreEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password }: { id: bigint; password: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).restoreEvidence(id, password);
      if (result && "err" in result) throw new Error(result.err as string);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-evidence", variables.password],
      });
    },
  });
}

export function useAdminDeleteClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password }: { id: bigint; password: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminDeleteClaim(id, password);
      if (result && "err" in result) throw new Error(result.err as string);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-claims", variables.password],
      });
    },
  });
}

export function useAdminDeleteEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password }: { id: bigint; password: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminDeleteEvidence(id, password);
      if (result && "err" in result) throw new Error(result.err as string);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-evidence", variables.password],
      });
    },
  });
}

// ── Reply Likes ───────────────────────────────────────────────────────────────

export function useLikeReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      replyId,
      sessionId,
    }: { replyId: bigint; sessionId: string; evidenceId?: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.likeReply(replyId, sessionId);
    },
    onSuccess: (
      _data: unknown,
      variables: { replyId: bigint; sessionId: string; evidenceId?: bigint },
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["reply-likes", variables.replyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["reply-like-session", variables.replyId.toString()],
      });
      if (variables.evidenceId != null) {
        queryClient.invalidateQueries({
          queryKey: ["reply-like-counts", variables.evidenceId.toString()],
        });
      }
    },
  });
}

export function useReplyLikeCount(replyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["reply-likes", replyId?.toString()],
    queryFn: async () => {
      if (!actor || replyId === null) return 0n;
      return actor.getReplyLikeCount(replyId);
    },
    enabled: !!actor && !isFetching && replyId !== null,
  });
}

export function useSessionLikeForReply(
  replyId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["reply-like-session", replyId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || replyId === null || !sessionId) return false;
      return actor.getSessionLikeForReply(replyId, sessionId);
    },
    enabled: !!actor && !isFetching && replyId !== null && !!sessionId,
  });
}

export function useReplyLikeCounts(evidenceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, number>>({
    queryKey: ["reply-like-counts", evidenceId?.toString()],
    queryFn: async () => {
      if (!actor || evidenceId === null) return {};
      const counts: Array<[bigint, bigint]> =
        await actor.getReplyLikeCounts(evidenceId);
      const result: Record<string, number> = {};
      for (const [id, count] of counts) {
        result[id.toString()] = Number(count);
      }
      return result;
    },
    enabled: !!actor && !isFetching && evidenceId !== null,
    staleTime: 10_000,
  });
}

// ── Trusted Sources ───────────────────────────────────────────────────────────

export type TrustedSourceInfo = {
  id: bigint;
  upvotes: bigint;
  downvotes: bigint;
  isTrusted: boolean;
  domain: string;
  sourceType: string;
  adminOverride: boolean;
  adminOverrideNote: string;
  aboutBlurb: string;
  pinnedAdminComment: string;
  timestamp: bigint;
  suggestedByUsername: string;
};

export function useTrustedSources() {
  const { actor, isFetching } = useActor();
  return useQuery<TrustedSourceInfo[]>({
    queryKey: ["trusted-sources"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getTrustedSources();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSessionVoteForSource(
  sourceId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["source-vote", sourceId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || sourceId === null || !sessionId) return null;
      return (actor as any).getSessionVoteForSource(sourceId, sessionId);
    },
    enabled: !!actor && !isFetching && sourceId !== null && !!sessionId,
  });
}

export function useSuggestTrustedSource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      domain,
      sourceType,
      sessionId,
      username,
    }: {
      domain: string;
      sourceType: string;
      sessionId: string;
      username: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).suggestTrustedSource(
        domain,
        sourceType,
        sessionId,
        username,
      );
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-sources"] });
    },
  });
}

export function useVoteOnSource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      sessionId,
      direction,
    }: {
      sourceId: bigint;
      sessionId: string;
      direction: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).voteOnSource(
        sourceId,
        sessionId,
        direction,
      );
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trusted-sources"] });
      queryClient.invalidateQueries({
        queryKey: ["source-vote", variables.sourceId.toString()],
      });
    },
  });
}

export function useAdminRemoveSource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      password,
    }: { sourceId: bigint; password: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminRemoveSource(sourceId, password);
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-sources"] });
    },
  });
}

export function useAdminOverrideSource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      approved,
      note,
      password,
    }: {
      sourceId: bigint;
      approved: boolean;
      note: string;
      password: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminOverrideSource(
        sourceId,
        approved,
        note,
        password,
      );
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-sources"] });
    },
  });
}

export function useAdminSetPinnedComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      comment,
      password,
    }: {
      sourceId: bigint;
      comment: string;
      password: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminSetPinnedComment(
        sourceId,
        comment,
        password,
      );
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-sources"] });
    },
  });
}

export function useAdminFetchAboutBlurb() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      password,
    }: { sourceId: bigint; password: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminFetchAboutBlurb(
        sourceId,
        password,
      );
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result.__kind__ === "ok" ? (result.ok as string) : "";
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-sources"] });
    },
  });
}

// ── Source Comments ───────────────────────────────────────────────────────────

export type { SourceComment };

export function useSourceComments(sourceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<SourceComment[]>({
    queryKey: ["source-comments", sourceId?.toString()],
    queryFn: async () => {
      if (!actor || sourceId === null) return [];
      return actor.getSourceComments(sourceId);
    },
    enabled: !!actor && !isFetching && sourceId !== null,
  });
}

export function useAddSourceComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      parentCommentId,
      text,
      authorUsername,
      sessionId,
    }: {
      sourceId: bigint;
      parentCommentId: bigint;
      text: string;
      authorUsername: string;
      sessionId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.addSourceComment(
        sourceId,
        parentCommentId,
        text,
        authorUsername,
        sessionId,
      );
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["source-comments", variables.sourceId.toString()],
      });
    },
  });
}

export function useLikeSourceComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      sessionId,
      sourceId: _sourceId,
    }: {
      commentId: bigint;
      sessionId: string;
      sourceId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.likeSourceComment(commentId, sessionId);
    },
    onSuccess: (
      _data: unknown,
      variables: { commentId: bigint; sessionId: string; sourceId: bigint },
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "source-comment-like-session",
          variables.commentId.toString(),
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["source-comment-like-counts", variables.sourceId.toString()],
      });
    },
  });
}

export function useSessionLikeForSourceComment(
  commentId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["source-comment-like-session", commentId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || commentId === null || !sessionId) return false;
      return actor.getSessionLikeForSourceComment(commentId, sessionId);
    },
    enabled: !!actor && !isFetching && commentId !== null && !!sessionId,
  });
}

export function useSourceCommentLikeCounts(sourceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, number>>({
    queryKey: ["source-comment-like-counts", sourceId?.toString()],
    queryFn: async () => {
      if (!actor || sourceId === null) return {};
      const counts: Array<[bigint, bigint]> =
        await actor.getSourceCommentLikeCounts(sourceId);
      const result: Record<string, number> = {};
      for (const [id, count] of counts) {
        result[id.toString()] = Number(count);
      }
      return result;
    },
    enabled: !!actor && !isFetching && sourceId !== null,
    staleTime: 10_000,
  });
}

export function useReportSourceComment() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      commentId,
      sessionId,
    }: { commentId: bigint; sessionId: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.reportSourceComment(commentId, sessionId);
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
  });
}

export function useWikipediaBlurb(domain: string | null) {
  return useQuery<string | null>({
    queryKey: ["wikipedia-blurb", domain],
    queryFn: async () => {
      if (!domain) return null;
      const firstSegment = domain.split(".")[0];
      const title =
        firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        );
        if (!res.ok) return null;
        const data = await res.json();
        return (data.extract as string) || null;
      } catch {
        return null;
      }
    },
    enabled: !!domain,
    staleTime: 1000 * 60 * 60,
  });
}

// ── User Profiles ──────────────────────────────────────────────────────────────

export type { UserProfile, ReputationEvent };

export function useProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 30_000,
  });
}

export function useProfileByUsername(username: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile-by-username", username],
    queryFn: async () => {
      if (!actor || !username) return null;
      return actor.getProfileByUsername(username);
    },
    enabled: !!actor && !isFetching && !!username,
    staleTime: 60_000,
  });
}

export function useStatsByUsername(username: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{
    claimCount: bigint;
    evidenceCount: bigint;
    commentCount: bigint;
    replyCount: bigint;
    activityPoints: bigint;
    trustScore: bigint;
  } | null>({
    queryKey: ["stats-by-username", username],
    queryFn: async () => {
      if (!actor || !username) return null;
      return actor.getStatsByUsername(username);
    },
    enabled: !!actor && !isFetching && !!username,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      principal,
      username,
      bio,
      avatarUrl,
      privacySettings,
    }: {
      principal: Principal;
      username: string;
      bio: string;
      avatarUrl: string;
      privacySettings: PrivacySettings;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.createOrUpdateProfile(
        principal,
        username,
        bio,
        avatarUrl,
        privacySettings,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", variables.principal.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile-by-username", variables.username],
      });
    },
  });
}

export function useReputationEvents(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ReputationEvent[]>({
    queryKey: ["reputation-events", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getReputationEvents(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 30_000,
  });
}

export function useAddReputationEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      principal,
      action,
      points,
    }: {
      principal: Principal;
      action: string;
      points: bigint;
    }) => {
      if (!actor) return;
      return actor.addReputationEvent(principal, action, points);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reputation-events", variables.principal.toString()],
      });
    },
  });
}
